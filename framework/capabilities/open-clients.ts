import type { Page } from '@playwright/test';
import { CLIENTS_SUPPORTED_PERSONAS, ClientsPage } from '../../pages/clients.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenClientsCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!CLIENTS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Open Clients is not yet supported for persona "${row.persona}"`);
  }

  if (row.expectedResult === 'validation_error') {
    throw new Error(`Row ${row.caseNo}: validation_error is not supported for Open Clients`);
  }

  const clients = new ClientsPage(page, row.persona);
  await clients.open();
}
