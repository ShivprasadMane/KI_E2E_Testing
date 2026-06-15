import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnAction } from '../helpers/fetch-json-on-reload';
import { applicationDetailHeading } from '../helpers/applications/detail-page';
import { canAddApplicationComments } from '../helpers/applications/types';

export class ApplicationDetailPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    return this.persona === 'investor' ? '/investor' : '/adviser';
  }

  async assertLoaded(applicationId: string, displayId?: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/application/view/${applicationId}`));
    await expect(applicationDetailHeading(this.page)).toBeVisible({ timeout: 30_000 });
    if (displayId) {
      await expect(this.page.getByText(displayId).first()).toBeVisible();
    }
    await expect(this.page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  }

  async verifyApplicationDetails(applicationId: string, displayId?: string): Promise<void> {
    await this.assertLoaded(applicationId, displayId);
    await expect(this.page.locator('form, [class*="MuiGrid-root"], [class*="MuiBox-root"]').first()).toBeVisible({
      timeout: 30_000,
    });
  }

  async verifyApplicationStatus(_applicationId: string): Promise<void> {
    await expect(this.page.getByText('Application Status:', { exact: false })).toBeVisible();
    const statusValue = this.page
      .getByText('Application Status:', { exact: false })
      .locator('xpath=following-sibling::*[1]');
    await expect(statusValue).not.toBeEmpty();

    const historyEntries = this.page.getByText(/^Application (Draft|Submitted|Approved|Settled|Rejected|Signing|Archived|Cancelled)/i);
    if ((await historyEntries.count()) > 0) {
      await expect(historyEntries.first()).toBeVisible();
    }
  }

  async verifyComments(applicationId: string): Promise<void> {
    if (!canAddApplicationComments(this.persona)) {
      await expect(this.page.getByRole('button', { name: 'Add Comment' })).toHaveCount(0);
      return;
    }

    await expect(this.page.getByRole('button', { name: 'Add Comment' })).toBeVisible();
    const commentText = `E2E application comment ${Date.now()}`;

    await this.page.getByRole('button', { name: 'Add Comment' }).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await dialog.getByPlaceholder('Enter your comment here...').fill(commentText);

    await fetchJsonOnAction(
      this.page,
      (res) => res.url().includes('/application/comment') && res.request().method() === 'POST' && res.ok(),
      async () => {
        await dialog.getByRole('button', { name: 'Add Comment', exact: true }).click();
      },
    );

    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(this.page.getByText(commentText)).toBeVisible({ timeout: 30_000 });
  }

  async clickClose(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/application`));
  }
}
