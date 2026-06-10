import { test, expect } from '@playwright/test';
import { loginViaB2C } from '../../helpers/auth/login-b2c';
import { loginAsGuest } from '../../helpers/auth/login-guest';
import {
  assertGuestLoggedIn,
  assertInvestorLoggedIn,
  assertFuneralDirectorLoggedIn,
  assertFinancialAdviserLoggedIn,
  assertAdminLoggedIn,
} from '../../helpers/auth/assert-logged-in';
import { hasCredentials } from '../../helpers/env';

/**
 * Fresh login tests for every portal persona.
 * Based on EIPFrontEnd: Login.tsx, msal.config.ts, roleUtils.ts, TenantRoute.tsx.
 *
 * No codegen — each test performs a real login and verifies the correct landing page.
 */
test.describe('Login — all user types @login', () => {
  test.describe.configure({ mode: 'serial' });

  test('guest logs in via Apply Now (API, no B2C)', { tag: ['@login-guest'] }, async ({ page }) => {
    await loginAsGuest(page);
    await assertGuestLoggedIn(page);
  });

  test('investor logs in via B2C investor policy', { tag: ['@login-investor'] }, async ({ page }) => {
    test.skip(
      !hasCredentials('INVESTOR_EMAIL', 'INVESTOR_PASSWORD'),
      'Set INVESTOR_EMAIL and INVESTOR_PASSWORD in .env',
    );

    await loginViaB2C(page, 'investor', process.env.INVESTOR_EMAIL!, process.env.INVESTOR_PASSWORD!);
    await assertInvestorLoggedIn(page);
  });

  test('funeral director logs in via B2C adviser policy', { tag: ['@login-funeral'] }, async ({ page }) => {
    test.skip(
      !hasCredentials('FUNERAL_DIRECTOR_EMAIL', 'FUNERAL_DIRECTOR_PASSWORD'),
      'Set FUNERAL_DIRECTOR_EMAIL and FUNERAL_DIRECTOR_PASSWORD in .env',
    );

    await loginViaB2C(
      page,
      'adviser',
      process.env.FUNERAL_DIRECTOR_EMAIL!,
      process.env.FUNERAL_DIRECTOR_PASSWORD!,
    );
    await assertFuneralDirectorLoggedIn(page);
  });

  test('financial adviser logs in via B2C adviser policy', { tag: ['@login-adviser'] }, async ({ page }) => {
    test.skip(
      !hasCredentials('FINANCIAL_ADVISER_EMAIL', 'FINANCIAL_ADVISER_PASSWORD'),
      'Set FINANCIAL_ADVISER_EMAIL and FINANCIAL_ADVISER_PASSWORD in .env',
    );

    await loginViaB2C(
      page,
      'adviser',
      process.env.FINANCIAL_ADVISER_EMAIL!,
      process.env.FINANCIAL_ADVISER_PASSWORD!,
    );
    await assertFinancialAdviserLoggedIn(page);
  });

  test('admin logs in via B2C adviser policy', { tag: ['@login-admin'] }, async ({ page }) => {
    test.skip(
      !hasCredentials('ADMIN_EMAIL', 'ADMIN_PASSWORD'),
      'Set ADMIN_EMAIL and ADMIN_PASSWORD in .env',
    );

    await loginViaB2C(page, 'adviser', process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    await assertAdminLoggedIn(page);
  });
});

test.describe('Login — negative cases @login', () => {
  test('B2C rejects invalid adviser credentials', { tag: ['@login-invalid'] }, async ({ page }) => {
    await page.goto('/login');

    const card = page.locator('.MuiCard-root').filter({ hasText: 'Funeral Director / Adviser Portal' });
    await card.getByRole('button', { name: 'Log in / Register' }).click();

    await page.waitForURL(/b2clogin\.com/, { timeout: 60_000 });
    await page.locator('#signInName, #email, input[type="email"]').first().fill('invalid-user-does-not-exist');
    await page.locator('#password, input[type="password"]').first().fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in|log in|continue|submit/i }).first().click();

    // Should stay on B2C or return to login with error — not reach dashboard
    await page.waitForTimeout(5_000);
    const url = page.url();
    expect(url).not.toMatch(/\/adviser\/dashboard/);
  });
});
