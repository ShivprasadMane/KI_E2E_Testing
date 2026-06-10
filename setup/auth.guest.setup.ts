import { test as setup } from '@playwright/test';
import path from 'path';
import { loginAsGuest } from '../helpers/auth/login-guest';
import { AUTH_DIR } from '../helpers/env';

setup('save guest session', async ({ page }) => {
  await loginAsGuest(page);

  // Guest tokens live in sessionStorage (auth_session) — wait before saving state
  await page.waitForFunction(() => sessionStorage.getItem('auth_session') !== null, {
    timeout: 15_000,
  });

  await page.context().storageState({ path: path.join(AUTH_DIR, 'guest.json') });
});
