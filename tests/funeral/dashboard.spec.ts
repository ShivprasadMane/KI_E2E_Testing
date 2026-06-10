import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Funeral Director @funeral', () => {
  test('adviser dashboard loads for funeral director', async ({ page }) => {
    const dashboard = new DashboardPage(page, 'funeral');
    await dashboard.open();
    await dashboard.assertLoaded();
    await expect(page).toHaveURL(/\/adviser\/dashboard/);
  });
});
