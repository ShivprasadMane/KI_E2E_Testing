import type { Page } from '@playwright/test';
import { ApplicationsPage } from '../../pages/applications.page';
import { APPLICATIONS_SUPPORTED_PERSONAS } from '../../helpers/applications/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenApplicationFromListCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!APPLICATIONS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Open Application From List is not yet supported for persona "${row.persona}"`);
  }

  const applications = new ApplicationsPage(page, row.persona);
  if (!page.url().includes('/application')) {
    await applications.open();
  }
  await applications.openApplicationDetail();
}
