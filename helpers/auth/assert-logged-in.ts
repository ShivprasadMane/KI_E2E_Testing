import { Page, expect } from '@playwright/test';
import type { Persona } from '../../framework/data/matrix.types';

/** Guest lands on bond selection (GuestRoutes → /guest/select-bond). */
export async function assertGuestLoggedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/guest\/select-bond/);
  await expect(page.getByText(/funeral|life event|bond/i).first()).toBeVisible({ timeout: 30_000 });
}

/** Investor B2C → /investor/dashboard (InvestorRoutes). */
export async function assertInvestorLoggedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/investor\/dashboard/);
  await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
}

/** Funeral Director (Tenant.Admin/Director) → /adviser/dashboard + FuneralDirecorDashboard. */
export async function assertFuneralDirectorLoggedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/adviser\/dashboard/);
  await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('tab', { name: 'Applications' })).toBeVisible();
}

/** Financial Adviser (Tenant.Advisor/Advisoradmin) → /adviser/dashboard + FA dashboard. */
export async function assertFinancialAdviserLoggedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/adviser\/dashboard/);
  await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('tab', { name: 'Clients' })).toBeVisible();
}

/** KI Admin (System.Admin / ki_staff) → /adviser/dashboard; admin area reachable. */
export async function assertAdminLoggedIn(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/adviser\/dashboard/);
  await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });

  const claimsOrUsers = page.getByRole('tab', { name: /Claims|Users/i });
  await expect(claimsOrUsers.first()).toBeVisible({ timeout: 15_000 });

  await page.goto('/adviser/admin/interest-rate');
  await expect(page).toHaveURL(/\/adviser\/admin\/interest-rate/);
}

export async function assertLoginSuccess(page: Page, persona: Persona): Promise<void> {
  switch (persona) {
    case 'guest':
      await assertGuestLoggedIn(page);
      break;
    case 'investor':
      await assertInvestorLoggedIn(page);
      break;
    case 'funeral':
      await assertFuneralDirectorLoggedIn(page);
      break;
    case 'adviser':
      await assertFinancialAdviserLoggedIn(page);
      break;
    case 'admin':
      await assertAdminLoggedIn(page);
      break;
  }
}

const SUCCESS_URL_PATTERNS: Record<Persona, RegExp> = {
  guest: /\/guest\/select-bond/,
  investor: /\/investor\/dashboard/,
  funeral: /\/adviser\/dashboard/,
  adviser: /\/adviser\/dashboard/,
  admin: /\/adviser\/dashboard/,
};

/** After a failed login attempt, user must not reach the success landing URL. */
export async function assertLoginFailed(page: Page, persona: Persona): Promise<void> {
  await page.waitForTimeout(5_000);
  const url = page.url();
  expect(url).not.toMatch(SUCCESS_URL_PATTERNS[persona]);
}
