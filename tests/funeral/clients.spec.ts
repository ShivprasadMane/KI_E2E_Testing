import { test } from '@playwright/test';
import { ClientOverviewPage } from '../../pages/client-overview.page';
import { ClientsPage } from '../../pages/clients.page';
import { PolicyDetailPage } from '../../pages/policy-detail.page';

test.describe('Funeral Director clients tab @funeral @funeral-clients', () => {
  test.beforeEach(async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.open();
  });

  test('client table columns and API data match', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.verifyTableColumns();
    await clients.verifyTableDataMatchesApi();
  });

  test('search filters client names', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.verifySearch();
  });

  test('sortable columns toggle order', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.verifySortableColumns();
  });

  test('export client list excel', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.exportClientListExcel();
  });

  test('age bracket and claim status filters', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.verifyFilters();
  });

  test('pagination controls work', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    await clients.verifyPagination();
  });

  test('view information opens client overview and policy detail', async ({ page }) => {
    const clients = new ClientsPage(page, 'funeral');
    const { clientCode } = await clients.openClientOverview();

    const overview = new ClientOverviewPage(page, 'funeral');
    await overview.assertLoaded(clientCode);
    const data = await overview.fetchOverview(clientCode);
    await overview.verifyClientDetails(data);
    await overview.verifyPolicyTable(data);
    await overview.clickClose();

    await clients.openClientOverview({ requirePolicies: true });
    const portfoliocode = await overview.openPolicyDetail(0);

    const policy = new PolicyDetailPage(page, 'funeral');
    await policy.assertLoaded(portfoliocode);
    await policy.verifyPolicyData(portfoliocode);
    await policy.clickClose();
  });
});
