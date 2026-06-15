import { Page, expect } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';

export class DashboardPage {
  constructor(
    protected readonly page: Page,
    private readonly persona: Persona,
  ) {}

  async open(): Promise<void> {
    if (this.persona === 'guest') {
      throw new Error('Guest users have no dashboard — use /guest/select-bond');
    }
    const prefix = this.persona === 'investor' ? 'investor' : 'adviser';
    await this.page.goto(`/${prefix}/dashboard`);
  }

  /** Assert dashboard loaded with persona-specific nav/widgets (EIPFrontEnd dashboard/index.tsx). */
  async assertLoaded(): Promise<void> {
    await assertDashboardLoaded(this.page, this.persona);
  }
}

export async function assertDashboardLoaded(page: Page, persona: Persona): Promise<void> {
  switch (persona) {
    case 'guest':
      throw new Error('Open Dashboard is not applicable for guest persona');

    case 'investor':
      await expect(page).toHaveURL(/\/investor\/dashboard/);
      await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('tab', { name: 'Clients' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Policies' })).toBeVisible();
      break;

    case 'funeral':
      await expect(page).toHaveURL(/\/adviser\/dashboard/);
      await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('tab', { name: 'Clients' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Policies' })).toBeVisible();
      break;

    case 'adviser':
      await expect(page).toHaveURL(/\/adviser\/dashboard/);
      await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('tab', { name: 'Clients' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Policies' })).toBeVisible();
      break;

    case 'admin':
      await expect(page).toHaveURL(/\/adviser\/dashboard/);
      await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('tab', { name: /Claims|Users/i }).first()).toBeVisible({
        timeout: 15_000,
      });
      break;
  }

  await page.waitForLoadState('networkidle').catch(() => {});
}
