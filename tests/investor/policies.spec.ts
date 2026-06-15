import { test } from '@playwright/test';
import { PolicyDetailLayoutPage } from '../../pages/policy-detail-layout.page';
import { PoliciesPage } from '../../pages/policies.page';

test.describe('Investor policies tab @investor @investor-policies', () => {
  test.beforeEach(async ({ page }) => {
    const policies = new PoliciesPage(page, 'investor');
    await policies.open();
  });

  test('policy table columns and API data match', async ({ page }) => {
    const policies = new PoliciesPage(page, 'investor');
    await policies.verifyTableColumns();
    await policies.verifyTableDataMatchesApi();
  });

  test('search sort print and pagination', async ({ page }) => {
    const policies = new PoliciesPage(page, 'investor');
    await policies.verifySearch();
    await policies.verifySortableColumns();
    await policies.exportPolicyListExcel();
    await policies.verifyFilters();
    await policies.verifyPagination();
  });

  test('view details opens policy detail sections', async ({ page }) => {
    const policies = new PoliciesPage(page, 'investor');
    const portfoliocode = await policies.openPolicyDetail();

    const detail = new PolicyDetailLayoutPage(page, 'investor');
    await detail.assertLoaded(portfoliocode);
    await detail.verifyClientPolicyTab(portfoliocode);
    await detail.verifyDetailSections(portfoliocode);
    await detail.openPrintReportDialog();
    await detail.verifyDocumentsSection();
    await detail.verifyAdditionalDocumentsSection();
    await detail.clickClose();
  });
});
