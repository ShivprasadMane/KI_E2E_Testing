import { test, expect } from '@playwright/test';
import { loginAsGuest } from '../../helpers/auth/login-guest';

test.describe('Guest @guest', () => {
  // Guest auth uses sessionStorage — log in fresh each test (more reliable than storageState)
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
  });

  test('select bond page loads after guest login', async ({ page }) => {
    await expect(page).toHaveURL(/\/guest\/select-bond/);
    await expect(page.getByText(/bond|application|select/i).first()).toBeVisible();
  });
});
