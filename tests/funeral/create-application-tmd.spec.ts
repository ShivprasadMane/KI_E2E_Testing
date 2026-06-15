import { test } from '@playwright/test';
import { ApplicationsPage } from '../../pages/applications.page';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';

test.describe('Funeral Director create application TMD @funeral @create-application-tmd', () => {
  test.beforeEach(async ({ page }) => {
    const applications = new ApplicationsPage(page, 'funeral');
    await applications.open();
    const dialog = new ApplicationCreateDialogPage(page, 'funeral');
    await dialog.clickCreateNewOnApplications();
  });

  test('TMD questions load from API', async ({ page }) => {
    const dialog = new ApplicationCreateDialogPage(page, 'funeral');
    const questions = await loadTmdQuestionsForPersona(page, 'funeral');
    await dialog.expectQuestionsVisible(questions);
  });

  test('wrong answer shows warning and disables confirm', async ({ page }) => {
    const dialog = new ApplicationCreateDialogPage(page, 'funeral');
    const questions = await loadTmdQuestionsForPersona(page, 'funeral');
    await dialog.selectFuneralBondType('PREPAID');
    const wrong: 'yes' | 'no' = questions[0].answer.toLowerCase() === 'yes' ? 'no' : 'yes';
    await dialog.answerTmdQuestionAtIndex(0, wrong, questions);
    await dialog.expectWarningVisible();
    await dialog.expectConfirmEnabled(false);
  });

  test('confirm enables after bond and correct answers', async ({ page }) => {
    const dialog = new ApplicationCreateDialogPage(page, 'funeral');
    await dialog.selectFuneralBondType('PREPAID');
    await dialog.answerTmdQuestions('yes,no,no,no');
    await dialog.expectConfirmEnabled(true);
  });
});
