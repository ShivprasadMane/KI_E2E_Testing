import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Financial Adviser @adviser', () => {
  test('adviser dashboard loads for financial adviser', async ({ page }) => {
    const dashboard = new DashboardPage(page, 'adviser');
    await dashboard.open();
    await dashboard.assertLoaded();
    await expect(page).toHaveURL(/\/adviser\/dashboard/);
  });
});
