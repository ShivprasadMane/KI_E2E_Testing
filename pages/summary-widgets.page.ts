import { expect, type Locator, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import {
  applicationStatusToRows,
  assertSummaryRowsMatch,
  claimStatusToRows,
  parseSummaryTableRows,
  type ApplicationStatusCount,
  type ClaimStatusCount,
} from '../helpers/dashboard/summary-status';

type SummaryWidget = 'Applications Summary' | 'Claims Summary';

const WIDGET_CONFIG: Record<
  SummaryWidget,
  { apiPath: string; toRows: (data: ApplicationStatusCount | ClaimStatusCount) => ReturnType<typeof applicationStatusToRows> }
> = {
  'Applications Summary': {
    apiPath: '/application/status-counts',
    toRows: (data) => applicationStatusToRows(data as ApplicationStatusCount),
  },
  'Claims Summary': {
    apiPath: '/claim/status-counts',
    toRows: (data) => claimStatusToRows(data as ClaimStatusCount),
  },
};

export class SummaryWidgetsPage {
  constructor(private readonly page: Page) {}

  private widget(title: SummaryWidget): Locator {
    return this.page.getByText(title, { exact: true }).locator('xpath=ancestor::div[.//table][1]');
  }

  private datePicker() {
    return this.page.locator('.react-datepicker');
  }

  async readWidgetTable(title: SummaryWidget) {
    const section = this.widget(title);
    const rows = section.locator('tbody tr');
    const parsed: string[][] = [];

    for (let i = 0; i < (await rows.count()); i++) {
      const cells = await rows.nth(i).locator('td').allTextContents();
      parsed.push(cells.map((cell) => cell.trim()));
    }

    return parseSummaryTableRows(parsed);
  }

  private async waitForStatusCounts<T>(
    title: SummaryWidget,
    predicate?: (body: { fromDate: string | null; toDate: string | null }) => boolean,
  ): Promise<T> {
    const config = WIDGET_CONFIG[title];
    const response = await this.page.waitForResponse((res) => {
      if (!res.url().includes(config.apiPath) || res.request().method() !== 'POST') {
        return false;
      }
      if (!predicate) return true;
      const body = res.request().postDataJSON() as { fromDate: string | null; toDate: string | null };
      return predicate(body);
    });
    return (await response.json()) as T;
  }

  async verifyDefaultSummary(title: SummaryWidget): Promise<void> {
    const config = WIDGET_CONFIG[title];
    const [response] = await Promise.all([
      this.page.waitForResponse((res) => {
        if (!res.url().includes(config.apiPath) || res.request().method() !== 'POST') {
          return false;
        }
        const body = res.request().postDataJSON() as { fromDate: string | null; toDate: string | null };
        return body.fromDate == null && body.toDate == null;
      }),
      this.page.reload({ waitUntil: 'domcontentloaded' }),
    ]);
    await expect(this.widget(title)).toBeVisible({ timeout: 30_000 });

    const data = (await response.json()) as ApplicationStatusCount | ClaimStatusCount;
    const uiRows = await this.readWidgetTable(title);
    assertSummaryRowsMatch(uiRows, config.toRows(data), title);
  }

  async applyDateRange(title: SummaryWidget, startDayIndex = 0, endDayIndex = 4): Promise<void> {
    const section = this.widget(title);
    await section.getByRole('button', { name: 'cal' }).click();
    await expect(this.datePicker()).toBeVisible();

    const days = this.datePicker().locator(
      '.react-datepicker__day:not(.react-datepicker__day--outside-month):not(.react-datepicker__day--disabled)',
    );

    await days.nth(startDayIndex).click();

    const response = await Promise.all([
      this.waitForStatusCounts<ApplicationStatusCount | ClaimStatusCount>(title, (body) =>
        body.toDate != null,
      ),
      days.nth(endDayIndex).click(),
    ]).then(([data]) => data);

    const uiRows = await this.readWidgetTable(title);
    assertSummaryRowsMatch(uiRows, WIDGET_CONFIG[title].toRows(response), `${title} (filtered)`);
    await expect(section.getByText(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  }

  async clearDateRange(title: SummaryWidget): Promise<void> {
    const section = this.widget(title);
    const closeButton = section.getByRole('button', { name: 'close' });
    await expect(closeButton).toBeVisible();

    const data = await Promise.all([
      this.waitForStatusCounts<ApplicationStatusCount | ClaimStatusCount>(title, (body) =>
        body.fromDate == null && body.toDate == null,
      ),
      closeButton.click(),
    ]).then(([response]) => response);

    const uiRows = await this.readWidgetTable(title);
    assertSummaryRowsMatch(uiRows, WIDGET_CONFIG[title].toRows(data), `${title} (cleared)`);
    await expect(section.getByText(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/)).toHaveCount(0);
  }

  /** Default → filtered → cleared for Applications (and Claims on funeral dashboard). */
  async verifySummaryDateFilters(persona: Persona = 'funeral'): Promise<void> {
    await this.verifyDefaultSummary('Applications Summary');
    await this.applyDateRange('Applications Summary');
    await this.clearDateRange('Applications Summary');

    if (persona === 'funeral') {
      await this.verifyDefaultSummary('Claims Summary');
      await this.applyDateRange('Claims Summary');
      await this.clearDateRange('Claims Summary');
    }
  }
}
