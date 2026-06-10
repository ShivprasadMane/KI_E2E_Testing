import { test, expect } from '@playwright/test';

test.describe('Admin @admin', () => {
  test('admin interest rate page loads', async ({ page }) => {
    await page.goto('/adviser/admin/interest-rate');
    await expect(page).toHaveURL(/\/adviser\/admin\/interest-rate/);
  });
});
