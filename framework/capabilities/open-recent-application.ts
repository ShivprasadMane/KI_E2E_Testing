import type { Page } from '@playwright/test';
import { assertDashboardLoaded } from '../../pages/dashboard.page';
import { RecentApplicationsPage } from '../../pages/recent-applications.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeOpenRecentApplicationCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Open Recent Application applies to funeral or adviser — not ${row.persona}`,
    );
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Open Recent Application`);
  }

  const recent = new RecentApplicationsPage(page);
  await recent.openFirstApplicationView();

  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.goto('/adviser/dashboard');
  await assertDashboardLoaded(page, row.persona);
}
