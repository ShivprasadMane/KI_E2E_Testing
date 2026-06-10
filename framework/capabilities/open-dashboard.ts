import type { Page } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenDashboardCapability(page: Page, row: MatrixRow): Promise<void> {
  if (row.persona === 'guest') {
    throw new Error(`Row ${row.caseNo}: Open Dashboard is not applicable for guest persona`);
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Open Dashboard`);
  }

  const dashboard = new DashboardPage(page, row.persona);
  await dashboard.open();
  await dashboard.assertLoaded();
}
