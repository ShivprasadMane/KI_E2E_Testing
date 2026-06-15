import { expect, type Page } from '@playwright/test';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';
import { DashboardPage } from './dashboard.page';

type ApplicationSummaryResponse = {
  fbpolicies?: string;
  fbtotalamount?: string;
  fbadvisors?: string;
  policies?: string;
  totalamount?: string;
  advisors?: string;
  fbclaims?: string;
  fbclaimamount?: string;
  fbclaimadvisors?: string;
  claims?: string;
  claimamount?: string;
  claimadvisors?: string;
};

export class AdminDashboardPage extends DashboardPage {
  constructor(page: Page) {
    super(page, 'admin');
  }

  async verifySummaryCards(): Promise<void> {
    const data = await fetchJsonOnReload<ApplicationSummaryResponse>(this.page, (res) =>
      res.url().includes('/application/list') && res.ok(),
    );
    await expect(this.page.getByText('Application Inflows', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText('Claims Inflows', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Funeral Bonds').first()).toBeVisible();
    await expect(this.page.getByText('Life Event Bonds').first()).toBeVisible();

    const fbApps = Number.parseInt(data.fbpolicies ?? '0', 10);
    await expect(this.page.getByText(String(fbApps), { exact: true }).first()).toBeVisible();
  }

  async verifyApplicationsClaimsTabs(): Promise<void> {
    await expect(this.page.getByRole('tab', { name: 'Applications Summary' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.getByRole('tab', { name: 'Claims Summary' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Adviser Name' }).first()).toBeVisible();

    await this.page.getByRole('tab', { name: 'Claims Summary' }).click();
    await expect(this.page.getByRole('columnheader', { name: 'Policy Number' })).toBeVisible();
  }

  async verifyAdviserListTable(): Promise<void> {
    const adviserTable = this.page
      .getByRole('heading', { name: 'List of FD/Advisers and Adviser Codes' })
      .locator('xpath=ancestor::div[.//table][1]//table');

    await expect(this.page.getByRole('columnheader', { name: 'Total FUM' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(adviserTable.locator('tbody tr').first()).toBeVisible();
  }

  async exportApplicationsSummary(format: 'excel' | 'pdf'): Promise<void> {
    await this.page.getByRole('tab', { name: 'Applications Summary' }).click();
    await this.exportFromDialog('Export Summary', format, /^applications_summary\.(xlsx|pdf)$/i);
  }

  async exportClaimsSummary(format: 'excel' | 'pdf'): Promise<void> {
    await this.page.getByRole('tab', { name: 'Claims Summary' }).click();
    await this.exportFromDialog('Export Summary', format, /^claims_summary\.(xlsx|pdf)$/i);
  }

  async exportAdviserList(format: 'excel' | 'pdf'): Promise<void> {
    await this.exportFromDialog('Export List', format, /^adviser_list\.(xlsx|pdf)$/i);
  }

  private async exportFromDialog(buttonTitle: string, format: 'excel' | 'pdf', filename: RegExp): Promise<void> {
    await this.page.getByRole('button', { name: buttonTitle }).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const radioLabel = format === 'excel' ? /Excel/i : /PDF/i;
    await this.page.getByRole('radio', { name: radioLabel }).check();

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 60_000 }),
      this.page.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(filename);
    await expect(dialog).toBeHidden({ timeout: 15_000 });
  }

  async verifyAllExports(): Promise<void> {
    await this.exportApplicationsSummary('excel');
    await this.exportApplicationsSummary('pdf');
    await this.exportClaimsSummary('excel');
    await this.exportClaimsSummary('pdf');
    await this.exportAdviserList('excel');
    await this.exportAdviserList('pdf');
  }

  async verifyAllWidgets(): Promise<void> {
    await this.verifySummaryCards();
    await this.verifyApplicationsClaimsTabs();
    await this.verifyAdviserListTable();
  }
}
