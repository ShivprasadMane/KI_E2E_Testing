import type { Page } from '@playwright/test';
import { ApplicationsPage } from '../../pages/applications.page';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenCreateApplicationCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const dialog = new ApplicationCreateDialogPage(page, row.persona);

  if (row.persona === 'guest') {
    await page.goto('/guest/select-bond', { waitUntil: 'domcontentloaded' });
    await dialog.openGuestFuneralBondFlow();
    return;
  }

  if (row.persona === 'investor') {
    const applications = new ApplicationsPage(page, 'investor');
    await applications.open();
    await dialog.clickCreateNewOnApplications();
    await dialog.selectInvestorFuneralBondIfShown();
    return;
  }

  if (row.persona === 'funeral' || row.persona === 'adviser') {
    const applications = new ApplicationsPage(page, row.persona);
    await applications.open();
    await dialog.clickCreateNewOnApplications();
    if (row.persona === 'adviser') {
      await dialog.selectAdviserFuneralBondTypeIfShown();
    }
    return;
  }

  throw new Error(`Row ${row.caseNo}: Open Create Application is not supported for persona "${row.persona}"`);
}
