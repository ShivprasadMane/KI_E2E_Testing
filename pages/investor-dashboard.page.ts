import { expect, type Page } from '@playwright/test';
import { DashboardPage } from './dashboard.page';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';
import { parseCurrency } from '../helpers/dashboard/portfolio-summary';

type ExternalQuickLink =
  | { name: string | RegExp; urlPattern: RegExp; kind?: 'page' }
  | { name: string | RegExp; hrefPattern: RegExp; kind: 'pdf' };

/** External quick links on the investor dashboard (open in new tab). */
export const INVESTOR_EXTERNAL_QUICK_LINKS: readonly ExternalQuickLink[] = [
  { name: 'Our Products', urlPattern: /keyinvest\.com\.au/i },
  { name: 'PDS Life Events Bond', hrefPattern: /\.pdf/i, kind: 'pdf' },
  { name: 'PDS Funeral Bond', hrefPattern: /\.pdf/i, kind: 'pdf' },
  { name: 'Unit prices & Performance', urlPattern: /keyinvest\.com\.au/i },
  { name: /^(KeyInvest )?Forms$/i, urlPattern: /keyinvest\.com\.au/i },
  { name: 'TMD', hrefPattern: /keyinvest|\.pdf/i, kind: 'pdf' },
  { name: 'Complaints Resolution', urlPattern: /keyinvest\.com\.au/i },
  { name: 'Contact KeyInvest', urlPattern: /keyinvest\.com\.au/i },
];

type ClientBalanceSummary = {
  investedAmount: string;
  currentBalance: string;
};

type ClientPolicyItem = {
  portfoliocode: string;
  product: string;
};

type ClientApplicationItem = {
  id: string;
  bondType: string;
  status: string;
};

export class InvestorDashboardPage extends DashboardPage {
  constructor(page: Page) {
    super(page, 'investor');
  }

  quickLink(name: string | RegExp) {
    return this.page.getByRole('link', { name });
  }

  async assertQuickLinksVisible(): Promise<void> {
    for (const link of INVESTOR_EXTERNAL_QUICK_LINKS) {
      await expect(this.quickLink(link.name)).toBeVisible();
    }
  }

  async clickExternalQuickLink(link: ExternalQuickLink): Promise<void> {
    const locator = this.quickLink(link.name);

    if (link.kind === 'pdf') {
      await expect(locator).toHaveAttribute('href', link.hrefPattern);
      await expect(locator).toHaveAttribute('target', '_blank');
      const [popup] = await Promise.all([
        this.page.context().waitForEvent('page'),
        locator.click(),
      ]);
      expect(popup).not.toBe(this.page);
      await popup.close();
      return;
    }

    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'),
      locator.click(),
    ]);
    await popup.waitForURL(link.urlPattern, { timeout: 45_000, waitUntil: 'domcontentloaded' });
    await expect(popup).toHaveURL(link.urlPattern);
    await popup.close();
  }

  async verifyAllQuickLinks(): Promise<void> {
    await this.assertQuickLinksVisible();
    for (const link of INVESTOR_EXTERNAL_QUICK_LINKS) {
      await this.clickExternalQuickLink(link);
    }

    for (const extraPage of this.page.context().pages()) {
      if (extraPage !== this.page) {
        await extraPage.close();
      }
    }

    await this.assertLoaded();
  }

  private balanceSection() {
    return this.page
      .getByText('Balance of Policies', { exact: true })
      .locator('xpath=ancestor::div[contains(@class,"MuiBox-root")][1]');
  }

  private policySummarySection() {
    return this.page
      .getByText('Policy Summary', { exact: true })
      .first()
      .locator('xpath=ancestor::div[.//table][1]');
  }

  async verifyBalanceOfPolicies(): Promise<void> {
    const balance = await fetchJsonOnReload<ClientBalanceSummary>(this.page, (res) =>
      res.url().includes('/application/client/balance-summary') && res.ok(),
    );
    const section = this.balanceSection();
    await expect(section).toBeVisible();
    await expect(section.getByText('Invested Amount', { exact: true })).toBeVisible();
    await expect(section.getByText('Current Balance', { exact: true })).toBeVisible();

    const invested = parseCurrency(balance.investedAmount);
    const current = parseCurrency(balance.currentBalance);
    const investedLabel = invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const currentLabel = current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await expect(section).toContainText(investedLabel);
    await expect(section).toContainText(currentLabel);
  }

  async verifyPolicySummary(): Promise<void> {
    const policies = await fetchJsonOnReload<ClientPolicyItem[]>(this.page, (res) =>
      res.url().includes('/application/client/policy-summary') && res.ok(),
    );
    const section = this.policySummarySection();
    await expect(section).toBeVisible();

    if (policies.length > 0) {
      await expect(section.getByText(policies[0].portfoliocode)).toBeVisible({ timeout: 30_000 });
    }
  }

  async verifyApplicationsListing(): Promise<void> {
    const applications = await fetchJsonOnReload<ClientApplicationItem[]>(this.page, (res) =>
      res.url().includes('/application/client/applications-listing') && res.ok(),
    );
    await expect(this.page.getByText('Applications Listing', { exact: true })).toBeVisible();

    if (applications.length > 0) {
      await expect(this.page.getByText(applications[0].id)).toBeVisible({ timeout: 30_000 });
    }
  }

  async verifyAllWidgets(): Promise<void> {
    await this.verifyBalanceOfPolicies();
    await this.verifyPolicySummary();
    await this.verifyApplicationsListing();
  }
}
