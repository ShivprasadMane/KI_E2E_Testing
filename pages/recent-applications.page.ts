import { expect, type Page } from '@playwright/test';
import { applicationDetailHeading } from '../helpers/applications/detail-page';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';

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
    const apps = await fetchJsonOnReload<RecentApplicationSummary[]>(this.page, (res) =>
      res.url().includes('/application/latest') && res.ok(),
    );
    await expect(this.section().locator('tbody tr').first()).toBeVisible({ timeout: 30_000 });
    return apps;
  }

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

    await expect(applicationDetailHeading(this.page)).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText(application.displayId)).toBeVisible();
    await expect(this.page.getByText(applicantName)).toBeVisible();

    return { application, applicantName };
  }
}
