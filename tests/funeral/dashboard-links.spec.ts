import { test } from '@playwright/test';
import {
  FuneralDashboardPage,
  FUNERAL_EXTERNAL_QUICK_LINKS,
} from '../../pages/funeral-dashboard.page';

test.describe('Funeral Director dashboard quick links @funeral @funeral-links', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('all quick links are visible on dashboard', async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.assertQuickLinksVisible();
  });

  for (const link of FUNERAL_EXTERNAL_QUICK_LINKS) {
    test(`"${link.name}" opens correct external page`, async ({ page }) => {
      const dashboard = new FuneralDashboardPage(page);
      await dashboard.clickExternalQuickLink(link);
    });
  }

  test('Annual Statement opens in-app report', async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.openAnnualStatement();
  });
});
