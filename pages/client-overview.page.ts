import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';
import { productDisplayName } from '../helpers/clients/client-list';
import type { ClientOverviewResponse } from '../helpers/clients/types';

export class ClientOverviewPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    return this.persona === 'investor' ? '/investor' : '/adviser';
  }

  private policySection() {
    return this.page.locator('div').filter({ has: this.page.getByText('Policy Details', { exact: true }) });
  }

  policyTableRows() {
    return this.policySection().locator('table tbody tr');
  }

  async fetchOverview(clientCode: string): Promise<ClientOverviewResponse> {
    return fetchJsonOnReload<ClientOverviewResponse>(this.page, (res) => {
      if (res.request().method() !== 'GET') return false;
      return res.url().includes(`/owner/client-info/${clientCode}`) && res.ok();
    });
  }

  async assertLoaded(clientCode: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/clients/overview/${clientCode}`));
    await expect(this.page.getByText('Client Details', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByRole('button', { name: 'Close' })).toBeVisible();
  }

  async verifyClientDetails(data: ClientOverviewResponse): Promise<void> {
    const owner = data.firstownerDto;
    const fullName = [owner.givenname, owner.middlename, owner.surname].filter(Boolean).join(' ');
    if (fullName) {
      await expect(this.page.getByText(fullName, { exact: false }).first()).toBeVisible();
    }
    if (owner.givenname) {
      await expect(this.page.getByText(owner.givenname, { exact: true }).first()).toBeVisible();
    }
    if (owner.email) {
      await expect(this.page.getByText(owner.email)).toBeVisible();
    }
    if (owner.address?.[0]?.suburb) {
      await expect(this.page.getByText(owner.address[0].suburb, { exact: false }).first()).toBeVisible();
    }
  }

  async verifyPolicyTable(data: ClientOverviewResponse): Promise<void> {
    const policies = data.policyDetailDto ?? [];
    if (policies.length === 0) {
      return;
    }

    await expect(this.page.getByText('Policy Details', { exact: true })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Policy Number' })).toBeVisible();

    const first = policies[0];
    if (first.portfoliocode) {
      await expect(this.page.getByText(first.portfoliocode).first()).toBeVisible();
    }
    const productLabel = productDisplayName(first.product);
    if (productLabel) {
      await expect(this.page.getByText(productLabel).first()).toBeVisible();
    }
    expect(await this.policyTableRows().count()).toBeGreaterThan(0);
  }

  async clickClose(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close' }).click();
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/clients`));
  }

  async openPolicyDetail(rowIndex = 0): Promise<string> {
    const row = this.policyTableRows().nth(rowIndex);
    await expect(row).toBeVisible();

    await row.getByText('View Information', { exact: true }).click();
    await this.page.waitForURL(/\/policies\/detail\//);

    const match = this.page.url().match(/\/policies\/detail\/([^/?#]+)/);
    expect(match?.[1], 'Policy number from URL').toBeTruthy();
    return match![1];
  }
}
