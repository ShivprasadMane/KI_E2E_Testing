import { test } from '@playwright/test';
import { FuneralDashboardPage } from '../../pages/funeral-dashboard.page';
import { RecentApplicationsPage } from '../../pages/recent-applications.page';

test.describe('Funeral Director recent applications @funeral @funeral-recent-app', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('first recent application opens application details', async ({ page }) => {
    const recent = new RecentApplicationsPage(page);
    await recent.openFirstApplicationView();
  });
});
