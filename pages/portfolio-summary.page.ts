import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import {
  buildExpectedAdviserPortfolioSummary,
  buildExpectedPortfolioSummary,
  flattenPortfolioRows,
  parseCurrency,
  type ApplicationCountSlice,
  type PortfolioSummaryRow,
} from '../helpers/dashboard/portfolio-summary';

export class PortfolioSummaryPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona = 'funeral',
  ) {}

  private portfolioTable() {
    return this.page
      .getByText('Portfolio Summary', { exact: true })
      .locator('xpath=ancestor::div[.//table][1]//table')
      .first();
  }

  async fetchApplicationCounts(): Promise<ApplicationCountSlice[]> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/application/counts') && res.ok(),
        { timeout: 60_000 },
      ),
      this.page.reload({ waitUntil: 'domcontentloaded' }),
    ]);
    await this.portfolioTable().waitFor({ state: 'visible', timeout: 30_000 });
    return (await response.json()) as ApplicationCountSlice[];
  }

  async readTableRows(): Promise<PortfolioSummaryRow[]> {
    const table = this.portfolioTable();
    await expect(table).toBeVisible({ timeout: 30_000 });

    const rows: PortfolioSummaryRow[] = [];
    const trs = table.locator('tbody tr');
    const count = await trs.count();

    for (let i = 0; i < count; i++) {
      const cells = await trs.nth(i).locator('td').allTextContents();
      if (cells.length < 3) continue;

      const product = cells[0]?.trim() ?? '';
      if (!product || product === 'Total') continue;

      rows.push({
        product,
        policies: Number.parseInt(cells[1]?.trim() ?? '0', 10) || 0,
        amount: parseCurrency(cells[2] ?? '0'),
      });
    }

    return rows;
  }

  async readTotalRow(): Promise<{ policies: number; amount: number }> {
    const table = this.portfolioTable();
    // NFDA funeral dashboard: Total is the last tbody row.
    // Financial adviser dashboard: Total is in MUI TableFooter (tfoot).
    const totalRow = table.locator('tbody tr, tfoot tr').filter({ hasText: 'Total' }).last();
    await expect(totalRow).toBeVisible({ timeout: 30_000 });

    const cells = await totalRow.locator('td').allTextContents();
    return {
      policies: Number.parseInt(cells[1]?.trim() ?? '0', 10) || 0,
      amount: parseCurrency(cells[2] ?? '0'),
    };
  }

  /**
   * Verify UI matches `/application/counts` and total row math (frontend rules).
   */
  async verifyCalculations(): Promise<void> {
    const counts = await this.fetchApplicationCounts();
    const expected =
      this.persona === 'adviser'
        ? buildExpectedAdviserPortfolioSummary(counts)
        : buildExpectedPortfolioSummary(counts);
    const expectedFlat = flattenPortfolioRows(expected);

    const uiRows = await this.readTableRows();
    const uiTotal = await this.readTotalRow();

    for (const expectedRow of expectedFlat.filter((row) => row.product !== 'Total')) {
      const actual = uiRows.find((row) => row.product === expectedRow.product);
      expect(actual, `Missing Portfolio Summary row: ${expectedRow.product}`).toBeDefined();
      expect(actual!.policies, `${expectedRow.product} policies`).toBe(expectedRow.policies);
      expect(actual!.amount, `${expectedRow.product} amount`).toBeCloseTo(expectedRow.amount, 2);
    }

    expect(uiTotal.policies, 'Total policies').toBe(expected.total.policies);
    expect(uiTotal.amount, 'Total amount').toBeCloseTo(expected.total.amount, 2);
  }
}
