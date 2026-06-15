import { expect } from '@playwright/test';
import { DashboardPage } from './dashboard.page';

type ExternalQuickLink =
  | { name: string | RegExp; urlPattern: RegExp; kind?: 'page' }
  | { name: string | RegExp; hrefPattern: RegExp; kind: 'pdf' };

/**
 * Quick links on the financial adviser dashboard (top bar).
 * Test portal label is "Forms"; source may say "KeyInvest Forms" — regex covers both.
 */
export const ADVISER_EXTERNAL_QUICK_LINKS: readonly ExternalQuickLink[] = [
  { name: /^(KeyInvest )?Forms$/i, urlPattern: /keyinvest\.com\.au/i },
  { name: 'Our Products', urlPattern: /keyinvest\.com\.au/i },
  { name: 'PDS Life Events Bonds', hrefPattern: /\.pdf/i, kind: 'pdf' },
  { name: 'PDS Funeral Bonds', hrefPattern: /\.pdf/i, kind: 'pdf' },
  { name: 'Unit prices & Performance', urlPattern: /keyinvest\.com\.au/i },
  { name: 'Complaints Resolution', urlPattern: /keyinvest\.com\.au/i },
  { name: 'Contact KeyInvest', urlPattern: /keyinvest\.com\.au/i },
  { name: 'TMD', hrefPattern: /keyinvest|\.pdf/i, kind: 'pdf' },
];

export class AdviserDashboardPage extends DashboardPage {
  constructor(page: import('@playwright/test').Page) {
    super(page, 'adviser');
  }

  quickLink(name: string | RegExp) {
    return this.page.getByRole('link', { name });
  }

  async assertQuickLinksVisible(): Promise<void> {
    for (const link of ADVISER_EXTERNAL_QUICK_LINKS) {
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
    for (const link of ADVISER_EXTERNAL_QUICK_LINKS) {
      await this.clickExternalQuickLink(link);
    }

    for (const extraPage of this.page.context().pages()) {
      if (extraPage !== this.page) {
        await extraPage.close();
      }
    }

    await this.assertLoaded();
  }
}
