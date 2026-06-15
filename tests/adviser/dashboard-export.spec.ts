import { test } from '@playwright/test';
import { AdviserDashboardPage } from '../../pages/adviser-dashboard.page';
import {
  DashboardExportPage,
  getDashboardExportSections,
} from '../../pages/dashboard-export.page';

const ADVISER_EXPORT_SECTIONS = getDashboardExportSections('adviser');

test.describe('Financial Adviser dashboard exports @adviser @adviser-export', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new AdviserDashboardPage(page);
    await dashboard.open();
    await dashboard.assertLoaded();
  });

  test('all dashboard sections have export buttons', async ({ page }) => {
    const exports = new DashboardExportPage(page, 'adviser');
    await exports.assertAllExportButtonsVisible();
  });

  for (const section of ADVISER_EXPORT_SECTIONS) {
    test(`"${section.buttonTitle}" exports Excel`, async ({ page }) => {
      const exports = new DashboardExportPage(page, 'adviser');
      await exports.exportSection(section, 'excel');
    });

    test(`"${section.buttonTitle}" exports PDF`, async ({ page }) => {
      const exports = new DashboardExportPage(page, 'adviser');
      await exports.exportSection(section, 'pdf');
    });
  }
});
