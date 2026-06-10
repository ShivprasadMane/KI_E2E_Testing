import { expect, type Page } from '@playwright/test';

export type RecentApplicationSummary = {
  id: string;
  displayId: string;
  firstName: string;
  lastName: string;
};

export class RecentApplicationsPage {
  constructor(private readonly page: Page) {}

  private section() {
    return this.page
      .getByText('Recent Applications', { exact: true })
      .locator('xpath=ancestor::div[.//table][1]');
  }

  async waitForRecentApplications(): Promise<RecentApplicationSummary[]> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/application/latest') && res.ok(),
        { timeout: 60_000 },
      ),
      this.page.reload({ waitUntil: 'domcontentloaded' }),
    ]);
    const apps = (await response.json()) as RecentApplicationSummary[];
    await expect(this.section().locator('tbody tr').first()).toBeVisible({ timeout: 30_000 });
    return apps;
  }

  /** Click the open-in-tab icon on the first recent application row. */
  async openFirstApplicationView(): Promise<{
    application: RecentApplicationSummary;
    applicantName: string;
  }> {
    const apps = await this.waitForRecentApplications();
    if (!apps.length) {
      throw new Error('No recent applications on dashboard');
    }

    const application = apps[0];
    const applicantName = `${application.firstName} ${application.lastName}`.trim();
    const firstRow = this.section().locator('tbody tr').first();

    await expect(firstRow).toContainText(applicantName);

    await Promise.all([
      this.page.waitForURL(new RegExp(`/application/view/${application.id}`)),
      firstRow.locator('td').last().click(),
    ]);

    await expect(this.page.getByText(/Application Details/i)).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText(application.displayId)).toBeVisible();
    await expect(this.page.getByText(applicantName)).toBeVisible();

    return { application, applicantName };
  }
}
