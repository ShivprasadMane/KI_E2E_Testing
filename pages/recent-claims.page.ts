import { expect, type Page } from '@playwright/test';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';
import type { LatestClaim } from '../helpers/dashboard/claim.types';

export class RecentClaimsPage {
  constructor(private readonly page: Page) {}

  private section() {
    return this.page
      .getByText('Recent Claims', { exact: true })
      .locator('xpath=ancestor::div[.//table][1]');
  }

  async waitForRecentClaims(): Promise<LatestClaim[]> {
    const claims = await fetchJsonOnReload<LatestClaim[]>(this.page, (res) =>
      res.url().includes('/claim/latest') && res.ok(),
    );
    await expect(this.section()).toBeVisible({ timeout: 30_000 });
    return claims;
  }

  async openFirstClaimView(): Promise<{ claim: LatestClaim; claimantName: string }> {
    const claims = await this.waitForRecentClaims();
    if (!claims.length) {
      throw new Error('No recent claims on dashboard — cannot verify claim drill-down');
    }

    const claim = claims[0];
    const claimantName = `${claim.firstName} ${claim.lastName}`.trim();
    const firstRow = this.section().locator('tbody tr').first();

    await expect(firstRow).toContainText(claim.firstName);

    await Promise.all([
      this.page.waitForURL(/\/policies\/detail\//, { timeout: 60_000 }),
      firstRow.locator('td').last().click(),
    ]);

    await expect(this.page).toHaveURL(new RegExp(`/policies/detail/${claim.portfoliocode ?? ''}`));
    return { claim, claimantName };
  }
}
