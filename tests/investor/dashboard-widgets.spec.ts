import { test } from '@playwright/test';
import { InvestorDashboardPage } from '../../pages/investor-dashboard.page';
import { NewsUpdatesPage } from '../../pages/news-updates.page';

test.describe('Investor dashboard widgets @investor', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new InvestorDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('investor quick links open correctly', async ({ page }) => {
    const dashboard = new InvestorDashboardPage(page);
    await dashboard.verifyAllQuickLinks();
  });

  test('investor dashboard widgets match API data', async ({ page }) => {
    const dashboard = new InvestorDashboardPage(page);
    await dashboard.verifyAllWidgets();
  });

  test('news section is present on investor dashboard', async ({ page }) => {
    const news = new NewsUpdatesPage(page, 'investor');
    await news.verifyNewsWidget();
  });
});
