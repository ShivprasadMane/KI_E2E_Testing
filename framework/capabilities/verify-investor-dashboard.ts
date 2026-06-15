import type { Page } from '@playwright/test';
import { InvestorDashboardPage } from '../../pages/investor-dashboard.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyInvestorDashboardCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (row.persona !== 'investor') {
    throw new Error(`Row ${row.caseNo}: Verify Investor Dashboard applies only to investor persona`);
  }

  const dashboard = new InvestorDashboardPage(page);
  await dashboard.verifyAllWidgets();
}
