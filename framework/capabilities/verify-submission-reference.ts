import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { getCreateApplicationContext } from '../data/create-application-context';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifySubmissionReferenceCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const ctx = getCreateApplicationContext(page);
  const reference = ctx.referenceId ?? ctx.applicationId;
  expect(reference, `Row ${row.caseNo}: submission reference`).toBeTruthy();

  await expect(page).toHaveURL(/\/application/i, { timeout: 60_000 });
}
