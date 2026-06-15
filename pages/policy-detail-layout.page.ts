import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnReload } from '../helpers/fetch-json-on-reload';
import type { PolicyDetailResponse } from '../helpers/policies/types';

const NAV_SECTIONS: Record<string, RegExp> = {
  client: /Client and Policy Details/i,
  rsp: /^Plans$/i,
  fundinfo: /Fund Information/i,
  performanceinfo: /Performance Information/i,
  contributionsum: /125% Contribution Summary/i,
  exemptcontribution: /Exempt Asset Allowable Contribution/i,
  advisorfee: /Ongoing Adviser Fee/i,
  transactionhistory: /Transaction History/i,
  claim: /^Claim$/i,
  document: /^Documents$/i,
  additionaldocument: /Submit\/View additional documents/i,
};

export class PolicyDetailLayoutPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    return this.persona === 'investor' ? '/investor' : '/adviser';
  }

  private navLink(label: RegExp) {
    return this.page.locator('a').filter({ hasText: label });
  }

  async assertLoaded(portfoliocode: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/policies/detail/${portfoliocode}`));
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`Policy Number\\s*:?\\s*${portfoliocode}`, 'i') }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByRole('button', { name: 'Close' })).toBeVisible();
  }

  async fetchPolicyData(portfoliocode: string): Promise<PolicyDetailResponse> {
    return fetchJsonOnReload<PolicyDetailResponse>(this.page, (res) =>
      res.url().includes(`/owner/clients/${portfoliocode}`) && res.ok(),
    );
  }

  async verifyClientPolicyTab(portfoliocode: string): Promise<PolicyDetailResponse> {
    await this.navLink(NAV_SECTIONS.client).first().click();
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/policies/detail/${portfoliocode}(/)?$`));

    const data = await this.fetchPolicyData(portfoliocode);
    await expect(this.page.getByRole('heading', { name: new RegExp(portfoliocode) })).toBeVisible();
    if (data.firstownerDto?.[0]?.givenname) {
      await expect(this.page.getByText(data.firstownerDto[0].givenname).first()).toBeVisible();
    }
    return data;
  }

  async openPrintReportDialog(): Promise<void> {
    await this.page.getByRole('button', { name: 'Print Report' }).click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: 'Print Report' });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText('Client Information')).toBeVisible();
    await dialog.getByRole('button').first().click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
  }

  private async assertSectionLoaded(sectionKey: string): Promise<void> {
    const label = NAV_SECTIONS[sectionKey];
    if (!label) return;

    const link = this.navLink(label);
    if ((await link.count()) === 0) return;

    await link.first().click();
    await expect(this.page.locator('table, [role="main"], .MuiBox-root').first()).toBeVisible({ timeout: 30_000 });
  }

  async verifyDetailSections(portfoliocode: string): Promise<void> {
    const sections = [
      'rsp',
      'fundinfo',
      'performanceinfo',
      'contributionsum',
      'exemptcontribution',
      'advisorfee',
      'transactionhistory',
      'claim',
      'document',
      'additionaldocument',
    ];

    for (const section of sections) {
      await this.assertSectionLoaded(section);
    }

    await this.navLink(NAV_SECTIONS.client).first().click();
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/policies/detail/${portfoliocode}`));
  }

  async verifyTransactionHistoryFilters(): Promise<void> {
    await this.assertSectionLoaded('transactionhistory');
    const fromDate = this.page.getByText('From Date', { exact: true });
    if (await fromDate.isVisible()) {
      const clear = this.page.getByRole('button', { name: 'Clear Filters' });
      if (await clear.isVisible()) {
        await clear.click();
      }
    }
  }

  async verifyDocumentsSection(): Promise<void> {
    await this.assertSectionLoaded('document');

    const uploadBtn = this.page.getByRole('button', { name: /Upload Other Document/i });
    if (this.persona === 'investor') {
      await expect(uploadBtn).toHaveCount(0);
      return;
    }

    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
      const dialog = this.page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 10_000 });
      await dialog.getByRole('button', { name: 'Cancel' }).click().catch(async () => {
        await this.page.keyboard.press('Escape');
      });
    }
  }

  async verifyAdditionalDocumentsSection(): Promise<void> {
    await this.assertSectionLoaded('additionaldocument');

    const submitBtn = this.page.getByRole('button', { name: /Submit Additional Documents/i });
    if ((await submitBtn.count()) === 0) return;

    await submitBtn.first().click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: /Submit Additional Documents|Document Type/i });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole('button', { name: 'Cancel' }).click().catch(async () => {
      await this.page.keyboard.press('Escape');
    });
  }

  async clickClose(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close' }).click();

    if (this.persona === 'admin' && /\/policies\/detail\//.test(this.page.url())) {
      // KI staff Close calls history.back(), which only pops the last detail sub-route.
      await this.page.goto(`${this.routePrefix()}/policies`);
    }

    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/policies`));
  }
}
