import type { Page } from '@playwright/test';
import { CLIENTS_SUPPORTED_PERSONAS, ClientsPage } from '../../pages/clients.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyClientsSortCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!CLIENTS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Verify Clients Sort is not yet supported for persona "${row.persona}"`);
  }

  const clients = new ClientsPage(page, row.persona);
  await clients.verifySortableColumns();
}
