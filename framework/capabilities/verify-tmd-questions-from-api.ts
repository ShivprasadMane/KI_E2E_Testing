import { expect, type Page } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyTmdQuestionsFromApiCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  await dialog.expectNewApplicationDialog();
  await dialog.selectAdviserFuneralBondTypeIfShown();
  await dialog.selectInvestorFuneralBondIfShown();
  await dialog.waitForTmdFormReady();

  if (row.persona === 'adviser' && !(await dialog.hasFuneralBondSubtypeStep())) {
    if (await dialog.isAdviserFaDeclarationPath()) {
      await expect(dialog.activeDialog().getByRole('checkbox').first()).toBeVisible({ timeout: 30_000 });
    } else {
      await expect(dialog.confirmButton()).toBeVisible({ timeout: 30_000 });
    }
    return;
  }

  const questions = await loadTmdQuestionsForPersona(page, row.persona);
  await dialog.expectQuestionsVisible(questions);
}
