import type { Page } from '@playwright/test';
import { PoliciesPage } from '../../pages/policies.page';
import { POLICIES_SUPPORTED_PERSONAS } from '../../helpers/policies/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyPoliciesTableCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!POLICIES_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Verify Policies Table is not yet supported for persona "${row.persona}"`);
  }

  const policies = new PoliciesPage(page, row.persona);
  await policies.verifyTableColumns();
  await policies.verifyTableDataMatchesApi();
}
