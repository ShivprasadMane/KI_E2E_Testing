import type { Page } from '@playwright/test';
import { PoliciesPage } from '../../pages/policies.page';
import { POLICIES_SUPPORTED_PERSONAS } from '../../helpers/policies/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenPolicyFromPoliciesCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!POLICIES_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Open Policy From Policies is not supported for persona "${row.persona}"`);
  }

  if (page.url().includes('/policies/detail/')) {
    return;
  }

  const policies = new PoliciesPage(page, row.persona);
  if (!page.url().includes('/policies')) {
    await policies.open();
  }
  await policies.openPolicyDetail();
}
