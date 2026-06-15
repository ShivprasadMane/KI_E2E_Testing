import { test, expect } from '@playwright/test';
import { AdviserDashboardPage } from '../../pages/adviser-dashboard.page';
import { AdviserWidgetsPage } from '../../pages/adviser-widgets.page';
import { ClientAgeDistributionPage } from '../../pages/client-age-distribution.page';
import { DashboardExportPage, getDashboardExportSections } from '../../pages/dashboard-export.page';
import { DashboardVideosPage } from '../../pages/dashboard-videos.page';
import { NewsUpdatesPage } from '../../pages/news-updates.page';

test.describe('Financial Adviser dashboard widgets @adviser', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new AdviserDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('adviser quick links open correctly', async ({ page }) => {
    const dashboard = new AdviserDashboardPage(page);
    await dashboard.verifyAllQuickLinks();
  });

  test('adviser-only widgets load', async ({ page }) => {
    const widgets = new AdviserWidgetsPage(page);
    await widgets.verifyAllWidgets();
  });

  test('client age distribution matches API', async ({ page }) => {
    const clientAge = new ClientAgeDistributionPage(page, 'adviser');
    await clientAge.verifyCalculations();
  });

  test('adviser dashboard exports include adviser-only sections', async ({ page }) => {
    const exports = new DashboardExportPage(page, 'adviser');
    await exports.assertAllExportButtonsVisible();
    const sections = getDashboardExportSections('adviser');
    expect(sections.some((s) => s.buttonTitle.includes('Allowable Contributions'))).toBe(true);
  });

  test('dashboard tutorial videos open', async ({ page }) => {
    const videos = new DashboardVideosPage(page, 'adviser');
    await videos.verifyAllVideosOpen();
  });

  test('news widget opens KeyInvest news', async ({ page }) => {
    const news = new NewsUpdatesPage(page, 'adviser');
    await news.verifyNewsWidget();
  });
});
