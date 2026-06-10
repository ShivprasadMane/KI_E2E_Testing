import type { Page } from '@playwright/test';
import { SummaryWidgetsPage } from '../../pages/summary-widgets.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeVerifySummaryDateFiltersCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Summary Date Filters applies to funeral, adviser, or admin — not ${row.persona}`,
    );
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Verify Summary Date Filters`);
  }

  const summaries = new SummaryWidgetsPage(page);
  await summaries.verifySummaryDateFilters(row.persona);
}
