import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { PolicyDetailLayoutPage } from './policy-detail-layout.page';

/** @deprecated Prefer PolicyDetailLayoutPage for full policy detail coverage. */
export class PolicyDetailPage extends PolicyDetailLayoutPage {
  constructor(page: Page, persona: Persona) {
    super(page, persona);
  }

  async verifyPolicyData(portfoliocode: string): Promise<void> {
    await this.verifyClientPolicyTab(portfoliocode);
  }
}
