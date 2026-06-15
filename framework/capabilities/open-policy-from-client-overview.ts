import type { Page } from '@playwright/test';
import { ClientOverviewPage } from '../../pages/client-overview.page';
import { ClientsPage, CLIENTS_SUPPORTED_PERSONAS } from '../../pages/clients.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeOpenPolicyFromClientOverviewCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!CLIENTS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Open Policy From Client Overview is not yet supported for persona "${row.persona}"`,
    );
  }

  const clients = new ClientsPage(page, row.persona);
  const overview = new ClientOverviewPage(page, row.persona);

  if (page.url().includes('/clients/overview/')) {
    const hasPolicies = (await overview.policyTableRows().count()) > 0;
    if (!hasPolicies) {
      await overview.clickClose();
    }
  }

  if (!page.url().includes('/clients/overview/')) {
    if (!page.url().includes('/clients')) {
      await clients.open();
    }
    await clients.openClientOverview({ requirePolicies: true });
  }

  await overview.openPolicyDetail(0);
}
