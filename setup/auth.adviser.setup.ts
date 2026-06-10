import { test as setup } from '@playwright/test';
import path from 'path';
import { loginViaB2C } from '../helpers/auth/login-b2c';
import { AUTH_DIR, hasCredentials } from '../helpers/env';

setup('save financial adviser session', async ({ page }) => {
  setup.skip(
    !hasCredentials('FINANCIAL_ADVISER_EMAIL', 'FINANCIAL_ADVISER_PASSWORD'),
    'Set FINANCIAL_ADVISER_EMAIL and FINANCIAL_ADVISER_PASSWORD in .env',
  );

  await loginViaB2C(
    page,
    'adviser',
    process.env.FINANCIAL_ADVISER_EMAIL!,
    process.env.FINANCIAL_ADVISER_PASSWORD!,
  );
  await page.context().storageState({ path: path.join(AUTH_DIR, 'financial-adviser.json') });
});
