import { test } from '@playwright/test';
import { AdminDashboardPage } from '../../pages/admin-dashboard.page';

test.describe('Admin Ki Staff dashboard @admin', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('admin dashboard widgets load', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.verifyAllWidgets();
  });

  test('admin dashboard exports work', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.verifyAllWidgets();
    await dashboard.verifyAllExports();
  });
});
