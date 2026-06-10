import type { Page } from '@playwright/test';
import { DashboardExportPage } from '../../pages/dashboard-export.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeVerifyDashboardExportsCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Dashboard Exports applies to funeral, adviser, or admin — not ${row.persona}`,
    );
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Verify Dashboard Exports`);
  }

  const exports = new DashboardExportPage(page, row.persona);
  await exports.verifyAllSectionExports();
}
