import { Page, expect } from '@playwright/test';

/** Guest login: clicks Apply Now → backend creates user → /guest/select-bond */
export async function loginAsGuest(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page.getByText('Welcome to KeyInvest')).toBeVisible();

  await page.getByRole('button', { name: 'Apply Now' }).click();
  await page.waitForURL(/\/guest\/select-bond/, { timeout: 60_000 });
}
