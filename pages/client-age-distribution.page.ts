import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnAction, fetchJsonOnReload } from '../helpers/fetch-json-on-reload';
import {
  assertClientAgeRowsMatch,
  buildExpectedClientAgeRows,
  parseClientAgeTableRows,
  type AgeRangeApiData,
} from '../helpers/dashboard/client-age';

function matchesAgeDistribution(filter: string) {
  return (res: import('@playwright/test').Response) => {
    if (!res.url().includes('/owner/age-distribution') || res.request().method() !== 'POST') {
      return false;
    }
    const body = res.request().postDataJSON() as { filter?: string };
    return (body.filter ?? 'All') === filter;
  };
}

export class ClientAgeDistributionPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona = 'funeral',
  ) {}

  private section() {
    return this.page
      .getByText('Client Age Distribution', { exact: true })
      .locator('xpath=ancestor::div[.//table][1]');
  }

  private async readTableRows() {
    const rows = this.section().locator('tbody tr');
    const parsed: string[][] = [];

    for (let i = 0; i < (await rows.count()); i++) {
      const cells = await rows.nth(i).locator('td').allTextContents();
      parsed.push(cells.map((cell) => cell.trim()));
    }

    return parseClientAgeTableRows(parsed);
  }

  async verifyDefaultDistribution(): Promise<void> {
    const apiData = await fetchJsonOnReload<AgeRangeApiData>(
      this.page,
      matchesAgeDistribution('All'),
    );

    await expect(this.section()).toBeVisible({ timeout: 30_000 });
    const uiRows = await this.readTableRows();
    assertClientAgeRowsMatch(uiRows, buildExpectedClientAgeRows(apiData));
  }

  async verifyAdviserFilters(): Promise<void> {
    if (this.persona !== 'adviser') return;

    for (const filter of ['FB', 'LEB'] as const) {
      const apiData = await fetchJsonOnAction<AgeRangeApiData>(
        this.page,
        matchesAgeDistribution(filter),
        () => this.section().getByLabel(filter, { exact: true }).click(),
      );

      const uiRows = await this.readTableRows();
      assertClientAgeRowsMatch(uiRows, buildExpectedClientAgeRows(apiData), `Client Age (${filter})`);
    }
  }

  async verifyCalculations(): Promise<void> {
    await this.verifyDefaultDistribution();
    await this.verifyAdviserFilters();
  }
}
