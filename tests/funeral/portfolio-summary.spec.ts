import { test } from '@playwright/test';
import { FuneralDashboardPage } from '../../pages/funeral-dashboard.page';
import { PortfolioSummaryPage } from '../../pages/portfolio-summary.page';

test.describe('Funeral Director portfolio summary @funeral @funeral-portfolio', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('portfolio summary UI matches API and total calculations', async ({ page }) => {
    const portfolio = new PortfolioSummaryPage(page);
    await portfolio.verifyCalculations();
  });
});
