import { test } from '@playwright/test';
import { ApplicationsPage } from '../../pages/applications.page';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';

test.describe('Investor create application entry @investor @create-application', () => {
  test('Create New opens funeral bond TMD dialog', async ({ page }) => {
    const applications = new ApplicationsPage(page, 'investor');
    await applications.open();

    const dialog = new ApplicationCreateDialogPage(page, 'investor');
    await dialog.clickCreateNewOnApplications();
    await dialog.selectInvestorFuneralBondIfShown();
    await dialog.waitForTmdFormReady();

    const questions = await loadTmdQuestionsForPersona(page, 'investor');
    await dialog.expectQuestionsVisible(questions);
  });
});
