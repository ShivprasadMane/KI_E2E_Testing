import type { Page } from '@playwright/test';
import { PolicyDetailLayoutPage } from '../../pages/policy-detail-layout.page';
import { POLICIES_SUPPORTED_PERSONAS } from '../../helpers/policies/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyPolicyDetailCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!POLICIES_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Verify Policy Detail is not yet supported for persona "${row.persona}"`);
  }

  const match = page.url().match(/\/policies\/detail\/([^/?#]+)/);
  const portfoliocode = match?.[1];
  if (!portfoliocode) {
    throw new Error(`Row ${row.caseNo}: Not on policy detail page — open a policy first`);
  }

  const policy = new PolicyDetailLayoutPage(page, row.persona);
  await policy.assertLoaded(portfoliocode);
  await policy.verifyClientPolicyTab(portfoliocode);
}
