import type { Page } from '@playwright/test';
import { ClientAgeDistributionPage } from '../../pages/client-age-distribution.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeVerifyClientAgeDistributionCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Client Age Distribution applies to funeral or adviser — not ${row.persona}`,
    );
  }

  const clientAge = new ClientAgeDistributionPage(page, row.persona);
  await clientAge.verifyCalculations();
}
