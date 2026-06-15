import { test } from '@playwright/test';
import { ApplicationsPage } from '../../pages/applications.page';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';

test.describe('Adviser create application TMD @adviser @create-application-tmd', () => {
  test.beforeEach(async ({ page }) => {
    const applications = new ApplicationsPage(page, 'adviser');
    await applications.open();
    const dialog = new ApplicationCreateDialogPage(page, 'adviser');
    await dialog.clickCreateNewOnApplications();
    await dialog.selectAdviserFuneralBondTypeIfShown();
  });

  test('TMD or FA declaration path opens', async ({ page }) => {
    const dialog = new ApplicationCreateDialogPage(page, 'adviser');
    const hasTmd = await dialog
      .activeDialog()
      .getByText('Select Funeral Bond Type')
      .isVisible()
      .catch(() => false);

    if (hasTmd) {
      const questions = await loadTmdQuestionsForPersona(page, 'adviser');
      await dialog.expectQuestionsVisible(questions);
    } else {
      await dialog.confirmAdviserDeclarationIfShown();
      await dialog.expectConfirmEnabled(true);
    }
  });
});
