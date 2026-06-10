import { Page, expect } from '@playwright/test';
import type { B2CTenant } from '../env';

const B2C_HOST = /b2clogin\.com/;

async function openLoginCard(page: Page, tenant: B2CTenant): Promise<void> {
  await page.goto('/login');
  await expect(page.getByText('Welcome to KeyInvest')).toBeVisible();

  const cardLabel =
    tenant === 'investor' ? 'Investor Portal' : 'Funeral Director / Adviser Portal';

  const card = page.locator('.MuiCard-root').filter({ hasText: cardLabel });
  await card.getByRole('button', { name: 'Log in / Register' }).click();
}

async function fillB2CForm(page: Page, email: string, password: string): Promise<void> {
  await page.waitForURL(B2C_HOST, { timeout: 60_000 });

  const emailInput = page.locator('#signInName, #email, input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 30_000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('#password, input[type="password"]').first();
  await passwordInput.fill(password);

  const submit = page.getByRole('button', { name: /sign in|log in|continue|submit/i }).first();
  await submit.click();
}

/**
 * Submit B2C credentials without waiting for dashboard (negative tests).
 */
export async function attemptLoginViaB2C(
  page: Page,
  tenant: B2CTenant,
  email: string,
  password: string,
): Promise<void> {
  await openLoginCard(page, tenant);
  await fillB2CForm(page, email, password);
}

/**
 * Log in via Azure B2C through the KeyInvest login page.
 * Investor and Adviser use different B2C policies but the same UI pattern.
 */
export async function loginViaB2C(
  page: Page,
  tenant: B2CTenant,
  email: string,
  password: string,
): Promise<void> {
  await attemptLoginViaB2C(page, tenant, email, password);

  const dashboardPattern =
    tenant === 'investor' ? /\/investor\/dashboard/ : /\/adviser\/dashboard/;
  await page.waitForURL(dashboardPattern, { timeout: 120_000 });
}
