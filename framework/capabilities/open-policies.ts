import type { Page } from '@playwright/test';
import { PoliciesPage } from '../../pages/policies.page';
import { POLICIES_SUPPORTED_PERSONAS } from '../../helpers/policies/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenPoliciesCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!POLICIES_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Open Policies is not yet supported for persona "${row.persona}"`);
  }

  const policies = new PoliciesPage(page, row.persona);
  await policies.open();
}
