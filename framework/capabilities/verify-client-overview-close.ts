import type { Page } from '@playwright/test';
import { ClientOverviewPage } from '../../pages/client-overview.page';
import { CLIENTS_SUPPORTED_PERSONAS } from '../../pages/clients.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyClientOverviewCloseCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!CLIENTS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Client Overview Close is not yet supported for persona "${row.persona}"`,
    );
  }

  const overview = new ClientOverviewPage(page, row.persona);
  await overview.clickClose();
}
