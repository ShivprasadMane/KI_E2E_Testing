import type { Page } from '@playwright/test';
import { AdminDashboardPage } from '../../pages/admin-dashboard.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyAdminDashboardCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (row.persona !== 'admin') {
    throw new Error(`Row ${row.caseNo}: Verify Admin Dashboard applies only to admin persona`);
  }

  const dashboard = new AdminDashboardPage(page);
  await dashboard.verifyAllWidgets();
}
