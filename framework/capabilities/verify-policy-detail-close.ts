import type { Page } from '@playwright/test';
import { PolicyDetailLayoutPage } from '../../pages/policy-detail-layout.page';
import { POLICIES_SUPPORTED_PERSONAS } from '../../helpers/policies/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyPolicyDetailCloseCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!POLICIES_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Policy Detail Close is not yet supported for persona "${row.persona}"`,
    );
  }

  const policy = new PolicyDetailLayoutPage(page, row.persona);
  await policy.clickClose();
}
