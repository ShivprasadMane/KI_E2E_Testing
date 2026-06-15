import type { Page } from '@playwright/test';
import { AdviserWidgetsPage } from '../../pages/adviser-widgets.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyAdviserWidgetsCapability(page: Page, row: MatrixRow): Promise<void> {
  if (row.persona !== 'adviser') {
    throw new Error(`Row ${row.caseNo}: Verify Adviser Widgets applies only to adviser persona`);
  }

  const widgets = new AdviserWidgetsPage(page);
  await widgets.verifyAllWidgets();
}
