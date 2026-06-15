import { expect, type Page } from '@playwright/test';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';

type AllowableContribution = {
  portfolioname: string;
  portfoliocode: string;
};

type UpcomingAnniversary = {
  portfolioname: string;
};

type AdviserFee = {
  portfolioname: string;
};

export class AdviserWidgetsPage {
  constructor(private readonly page: Page) {}

  async verifyAllowableContributions(): Promise<void> {
    const rows = await fetchJsonOnReload<AllowableContribution[]>(this.page, (res) =>
      res.url().includes('/owner/FBpolicies/') && res.ok(),
    );

    await expect(this.page.getByText(/Funeral Bond Allowable Contributions/i)).toBeVisible({
      timeout: 30_000,
    });

    if (rows.length > 0) {
      await expect(this.page.getByText(rows[0].portfolioname).first()).toBeVisible();
    }
  }

  async verifyUpcomingAnniversary(): Promise<void> {
    const rows = await fetchJsonOnReload<UpcomingAnniversary[]>(this.page, (res) =>
      res.url().includes('/owner/policiesByAnnv/') && res.ok(),
    );

    await expect(
      this.page.getByText('Approaching Anniversary Dates - Life Events Bond', { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    if (rows.length > 0) {
      await expect(this.page.getByText(rows[0].portfolioname).first()).toBeVisible();
    }
  }

  async verifyAdviserFees(): Promise<void> {
    const rows = await fetchJsonOnReload<AdviserFee[]>(this.page, (res) =>
      res.url().includes('/owner/advisorfee/') && res.ok(),
    );

    await expect(
      this.page.getByText('Adviser Fees and Client Consent End Date', { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    if (rows.length > 0) {
      await expect(this.page.getByText(rows[0].portfolioname).first()).toBeVisible();
    }
  }

  async verifyAllWidgets(): Promise<void> {
    await this.verifyAllowableContributions();
    await this.verifyUpcomingAnniversary();
    await this.verifyAdviserFees();
  }
}
