import { test as setup } from '@playwright/test';
import path from 'path';
import { loginViaB2C } from '../helpers/auth/login-b2c';
import { AUTH_DIR, hasCredentials } from '../helpers/env';

setup('save funeral director session', async ({ page }) => {
  setup.skip(
    !hasCredentials('FUNERAL_DIRECTOR_EMAIL', 'FUNERAL_DIRECTOR_PASSWORD'),
    'Set FUNERAL_DIRECTOR_EMAIL and FUNERAL_DIRECTOR_PASSWORD in .env',
  );

  await loginViaB2C(
    page,
    'adviser',
    process.env.FUNERAL_DIRECTOR_EMAIL!,
    process.env.FUNERAL_DIRECTOR_PASSWORD!,
  );
  await page.context().storageState({ path: path.join(AUTH_DIR, 'funeral-director.json') });
});
