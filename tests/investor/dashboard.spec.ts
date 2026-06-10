import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Investor @investor', () => {
  test('investor dashboard loads', async ({ page }) => {
    const dashboard = new DashboardPage(page, 'investor');
    await dashboard.open();
    await dashboard.assertLoaded();
    await expect(page).toHaveURL(/\/investor\/dashboard/);
  });
});
