import { test } from '@playwright/test';
import { FuneralDashboardPage } from '../../pages/funeral-dashboard.page';
import { SummaryWidgetsPage } from '../../pages/summary-widgets.page';

test.describe('Funeral Director summary date filters @funeral @funeral-summary-filters', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('Applications Summary date filter updates table from API', async ({ page }) => {
    const summaries = new SummaryWidgetsPage(page);
    await summaries.verifyDefaultSummary('Applications Summary');
    await summaries.applyDateRange('Applications Summary');
    await summaries.clearDateRange('Applications Summary');
  });

  test('Claims Summary date filter updates table from API', async ({ page }) => {
    const summaries = new SummaryWidgetsPage(page);
    await summaries.verifyDefaultSummary('Claims Summary');
    await summaries.applyDateRange('Claims Summary');
    await summaries.clearDateRange('Claims Summary');
  });
});
