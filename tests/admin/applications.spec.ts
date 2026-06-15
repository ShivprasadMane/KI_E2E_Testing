import { test } from '@playwright/test';
import { ApplicationDetailPage } from '../../pages/application-detail.page';
import { ApplicationsPage } from '../../pages/applications.page';

test.describe('Admin applications tab @admin @admin-applications', () => {
  test.beforeEach(async ({ page }) => {
    const applications = new ApplicationsPage(page, 'admin');
    await applications.open();
  });

  test('application table columns and API data match', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'admin');
    await applications.verifyTableColumns();
    await applications.verifyTableDataMatchesApi();
  });

  test('search sort print admin filters and pagination', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'admin');
    await applications.verifySearch();
    await applications.verifySortableColumns();
    await applications.exportApplicationListExcel();
    await applications.verifyFilters();
    await applications.verifyPagination();
  });

  test('view details status comments and close', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'admin');
    const { applicationId, displayId } = await applications.openApplicationDetail();

    const detail = new ApplicationDetailPage(page, 'admin');
    await detail.verifyApplicationDetails(applicationId, displayId);
    await detail.verifyApplicationStatus(applicationId);
    await detail.verifyComments(applicationId);
    await detail.clickClose();
  });
});
