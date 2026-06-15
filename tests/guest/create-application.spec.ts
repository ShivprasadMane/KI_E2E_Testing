import { test } from '@playwright/test';
import { loginAsGuest } from '../../helpers/auth/login-guest';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';

test.describe('Guest create application entry @guest @create-application', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGuest(page);
  });

  test('select funeral bond shows TMD questions', async ({ page }) => {
    const dialog = new ApplicationCreateDialogPage(page, 'guest');
    await dialog.openGuestFuneralBondFlow();
    await dialog.waitForTmdFormReady();

    const questions = await loadTmdQuestionsForPersona(page, 'guest');
    await dialog.expectQuestionsVisible(questions);
  });
});
