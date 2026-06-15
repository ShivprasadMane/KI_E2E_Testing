import type { Page } from '@playwright/test';
import { verifyConfirmationEmailOrReference } from '../../helpers/applications/create/confirmation-email';
import { getCreateApplicationContext } from '../data/create-application-context';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyConfirmationEmailCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const ctx = getCreateApplicationContext(page);
  const reference = ctx.referenceId ?? ctx.applicationId ?? '';
  const pattern = reference ? new RegExp(reference.slice(0, 8), 'i') : /submitted|application/i;
  await verifyConfirmationEmailOrReference(page, pattern);
}
