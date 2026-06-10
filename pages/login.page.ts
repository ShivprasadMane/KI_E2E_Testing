import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.page.getByText('Welcome to KeyInvest')).toBeVisible();
  }

  async expectInvestorCard(): Promise<void> {
    await expect(this.page.getByText('Investor Portal')).toBeVisible();
  }

  async expectAdviserCard(): Promise<void> {
    await expect(this.page.getByText('Funeral Director / Adviser Portal')).toBeVisible();
  }

  async expectApplyNowButton(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Apply Now' })).toBeVisible();
  }
}
