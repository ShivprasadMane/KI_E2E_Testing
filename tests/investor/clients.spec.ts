import { test } from '@playwright/test';
import { ClientsPage } from '../../pages/clients.page';
import { PoliciesPage } from '../../pages/policies.page';
import { PolicyDetailPage } from '../../pages/policy-detail.page';

test.describe('Investor clients tab @investor @investor-clients', () => {
  test.beforeEach(async ({ page }) => {
    const clients = new ClientsPage(page, 'investor');
    await clients.open();
  });

  test('clients page columns and empty list state', async ({ page }) => {
    const clients = new ClientsPage(page, 'investor');
    await clients.verifyTableColumns();
    await clients.verifyEmptyClientList();
  });

  test('search sort print filters and pagination on empty list', async ({ page }) => {
    const clients = new ClientsPage(page, 'investor');
    await clients.verifySearch();
    await clients.verifySortableColumns();
    await clients.exportClientListExcel();
    await clients.verifyFilters();
    await clients.verifyPagination();
  });

  test('policy detail opens from policies tab', async ({ page }) => {
    const policies = new PoliciesPage(page, 'investor');
    await policies.open();
    const portfoliocode = await policies.openPolicyDetail(0);

    const policy = new PolicyDetailPage(page, 'investor');
    await policy.assertLoaded(portfoliocode);
    await policy.verifyPolicyData(portfoliocode);
    await policy.clickClose();
  });
});
