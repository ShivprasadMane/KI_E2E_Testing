import { test } from '@playwright/test';
import { FuneralDashboardPage } from '../../pages/funeral-dashboard.page';
import {
  DASHBOARD_EXPORT_SECTIONS,
  DashboardExportPage,
} from '../../pages/dashboard-export.page';

test.describe('Funeral Director dashboard exports @funeral @funeral-export', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new FuneralDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('all dashboard sections have print/export buttons', async ({ page }) => {
    const exports = new DashboardExportPage(page);
    await exports.assertAllExportButtonsVisible();
  });

  for (const section of DASHBOARD_EXPORT_SECTIONS) {
    test(`"${section.buttonTitle}" exports Excel`, async ({ page }) => {
      const exports = new DashboardExportPage(page);
      await exports.exportSection(section, 'excel');
    });

    test(`"${section.buttonTitle}" exports PDF`, async ({ page }) => {
      const exports = new DashboardExportPage(page);
      await exports.exportSection(section, 'pdf');
    });
  }
});
