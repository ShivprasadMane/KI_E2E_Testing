import type { Page } from '@playwright/test';
import { ClientOverviewPage } from '../../pages/client-overview.page';
import { CLIENTS_SUPPORTED_PERSONAS } from '../../pages/clients.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyClientOverviewCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!CLIENTS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(`Row ${row.caseNo}: Verify Client Overview is not yet supported for persona "${row.persona}"`);
  }

  const match = page.url().match(/\/clients\/overview\/([^/?#]+)/);
  const clientCode = match?.[1];
  if (!clientCode) {
    throw new Error(`Row ${row.caseNo}: Not on client overview page — run Open Client Overview first`);
  }

  const overview = new ClientOverviewPage(page, row.persona);
  await overview.assertLoaded(clientCode);
  const data = await overview.fetchOverview(clientCode);
  await overview.verifyClientDetails(data);
  await overview.verifyPolicyTable(data);
}
