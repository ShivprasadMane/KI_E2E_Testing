import { test as setup } from '@playwright/test';
import path from 'path';
import { loginViaB2C } from '../helpers/auth/login-b2c';
import { AUTH_DIR, hasCredentials } from '../helpers/env';

setup('save admin session', async ({ page }) => {
  setup.skip(
    !hasCredentials('ADMIN_EMAIL', 'ADMIN_PASSWORD'),
    'Set ADMIN_EMAIL and ADMIN_PASSWORD in .env',
  );

  await loginViaB2C(page, 'adviser', process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  await page.context().storageState({ path: path.join(AUTH_DIR, 'admin.json') });
});
