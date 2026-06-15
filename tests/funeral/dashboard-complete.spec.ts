import { test } from '@playwright/test';
import { ClientAgeDistributionPage } from '../../pages/client-age-distribution.page';
import { DashboardVideosPage } from '../../pages/dashboard-videos.page';
import { FuneralDashboardPage } from '../../pages/funeral-dashboard.page';
import { NewsUpdatesPage } from '../../pages/news-updates.page';
import { RecentClaimsPage } from '../../pages/recent-claims.page';

test.describe('Funeral Director complete dashboard @funeral', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('client age distribution matches API', async ({ page }) => {
    const clientAge = new ClientAgeDistributionPage(page, 'funeral');
    await clientAge.verifyCalculations();
  });

  test('recent claim drill-down opens policy detail', async ({ page }) => {
    const recentClaims = new RecentClaimsPage(page);
    await recentClaims.openFirstClaimView();
  });

  test('dashboard tutorial videos open', async ({ page }) => {
    const videos = new DashboardVideosPage(page, 'funeral');
    await videos.verifyAllVideosOpen();
  });

  test('news widget opens KeyInvest news', async ({ page }) => {
    const news = new NewsUpdatesPage(page, 'funeral');
    await news.verifyNewsWidget();
  });
});
