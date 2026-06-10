import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { getPortalUrl } from '../../helpers/env';

test.describe('Portal smoke @smoke', () => {
  test('login page loads on test environment', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.expectInvestorCard();
    await login.expectAdviserCard();
    await login.expectApplyNowButton();
  });

  test('portal base URL is test environment', async () => {
    expect(getPortalUrl()).toBe('https://polite-plant-02b096d00.6.azurestaticapps.net');
  });
});
