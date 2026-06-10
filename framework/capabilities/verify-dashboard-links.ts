import type { Page } from '@playwright/test';
import { FuneralDashboardPage } from '../../pages/funeral-dashboard.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyDashboardLinksCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (row.persona !== 'funeral') {
    throw new Error(
      `Row ${row.caseNo}: Verify Dashboard Links applies only to funeral persona (NFDA quick links)`,
    );
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Verify Dashboard Links`);
  }

  const dashboard = new FuneralDashboardPage(page);
  await dashboard.verifyAllQuickLinks();
}
