import { test } from '@playwright/test';
import { ApplicationDetailPage } from '../../pages/application-detail.page';
import { ApplicationsPage } from '../../pages/applications.page';

test.describe('Investor applications tab @investor @investor-applications', () => {
  test.beforeEach(async ({ page }) => {
    const applications = new ApplicationsPage(page, 'investor');
    await applications.open();
  });

  test('application table columns and API data match', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'investor');
    await applications.verifyTableColumns();
    await applications.verifyTableDataMatchesApi();
  });

  test('search sort print and pagination', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'investor');
    await applications.verifySearch();
    await applications.verifySortableColumns();
    await applications.exportApplicationListExcel();
    await applications.verifyFilters();
    await applications.verifyPagination();
  });

  test('view details status and close', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'investor');
    const { applicationId, displayId } = await applications.openApplicationDetail();

    const detail = new ApplicationDetailPage(page, 'investor');
    await detail.verifyApplicationDetails(applicationId, displayId);
    await detail.verifyApplicationStatus(applicationId);
    await detail.verifyComments(applicationId);
    await detail.clickClose();
  });
});
