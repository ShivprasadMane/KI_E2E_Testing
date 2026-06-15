import { expect } from '@playwright/test';
import { DashboardPage } from './dashboard.page';

type ExternalQuickLink =
  | { name: string; urlPattern: RegExp; kind?: 'page' }
  | { name: string; hrefPattern: RegExp; kind: 'pdf' };

/** External quick links on NFDA Funeral Home Admin dashboard (open in new tab). */
export const FUNERAL_EXTERNAL_QUICK_LINKS: readonly ExternalQuickLink[] = [
  { name: 'Forms', urlPattern: /keyinvest\.com\.au\/forms-resources/ },
  { name: 'Our Products', urlPattern: /keyinvest\.com\.au\/our-products/ },
  { name: 'Contact KeyInvest', urlPattern: /keyinvest\.com\.au\/contact-us/ },
  { name: 'Complaints Resolution', urlPattern: /keyinvest\.com\.au\/complaints-resolution/ },
  { name: 'Unit prices & Performance', urlPattern: /keyinvest\.com\.au\/our-products\/unit-prices/ },
  {
    name: 'PDS Funeral Bonds',
    hrefPattern: /webprod\.keyinvest\.com\.au\/.*Funeral-Bond.*\.pdf/i,
    kind: 'pdf',
  },
];

const ANNUAL_STATEMENT = 'Annual Statement';

export class FuneralDashboardPage extends DashboardPage {
  constructor(page: import('@playwright/test').Page) {
    super(page, 'funeral');
  }

  quickLink(name: string) {
    return this.page.getByRole('link', { name });
  }

  async assertQuickLinksVisible(): Promise<void> {
    for (const link of FUNERAL_EXTERNAL_QUICK_LINKS) {
      await expect(this.quickLink(link.name)).toBeVisible();
    }
    await expect(this.quickLink(ANNUAL_STATEMENT)).toBeVisible();
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

  async openAnnualStatement(): Promise<void> {
    await this.quickLink(ANNUAL_STATEMENT).click();
    await expect(this.page).toHaveURL(/\/adviser\/annual-report/);
    await expect(this.page.getByRole('heading', { name: ANNUAL_STATEMENT })).toBeVisible();
  }

  /** Visibility + navigation for all NFDA funeral-home dashboard quick links. */
  async verifyAllQuickLinks(): Promise<void> {
    await this.assertQuickLinksVisible();
    for (const link of FUNERAL_EXTERNAL_QUICK_LINKS) {
      await this.clickExternalQuickLink(link);
    }
    await this.openAnnualStatement();
    // Annual Statement opens in the same tab — return to dashboard for any follow-on steps
    // (e.g. funeral-full continues with portfolio / exports / filters).
    await this.open();
    await this.assertLoaded();
  }
}
