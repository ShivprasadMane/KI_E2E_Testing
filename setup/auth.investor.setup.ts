import { test as setup } from '@playwright/test';
import path from 'path';
import { loginViaB2C } from '../helpers/auth/login-b2c';
import { AUTH_DIR, hasCredentials } from '../helpers/env';

setup('save investor session', async ({ page }) => {
  setup.skip(
    !hasCredentials('INVESTOR_EMAIL', 'INVESTOR_PASSWORD'),
    'Set INVESTOR_EMAIL and INVESTOR_PASSWORD in .env',
  );

  await loginViaB2C(page, 'investor', process.env.INVESTOR_EMAIL!, process.env.INVESTOR_PASSWORD!);
  await page.context().storageState({ path: path.join(AUTH_DIR, 'investor.json') });
});
