import type { Page } from '@playwright/test';
import { PortfolioSummaryPage } from '../../pages/portfolio-summary.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeVerifyPortfolioSummaryCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Portfolio Summary applies to funeral or adviser — not ${row.persona}`,
    );
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Verify Portfolio Summary`);
  }

  const portfolio = new PortfolioSummaryPage(page, row.persona);
  await portfolio.verifyCalculations();
}
