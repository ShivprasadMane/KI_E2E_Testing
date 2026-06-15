import type { Page } from '@playwright/test';
import { AdviserDashboardPage } from '../../pages/adviser-dashboard.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyAdviserDashboardLinksCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (row.persona !== 'adviser') {
    throw new Error(
      `Row ${row.caseNo}: Verify Adviser Dashboard Links applies only to adviser persona`,
    );
  }

  const dashboard = new AdviserDashboardPage(page);
  await dashboard.verifyAllQuickLinks();
}
