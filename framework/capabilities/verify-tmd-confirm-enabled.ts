import type { Page } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';
import { getMatrixBondType } from '../data/create-application-matrix';
import { primeFormDataContext } from './create-application/load-form-data';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyTmdConfirmEnabledCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  const data = primeFormDataContext(page, row);
  const questions = await loadTmdQuestionsForPersona(page, row.persona);

  await dialog.expectConfirmEnabled(false);

  if (row.persona !== 'guest' && row.persona !== 'investor') {
    await dialog.selectFuneralBondType(getMatrixBondType(row));
    await dialog.expectConfirmEnabled(false);
  }

  await dialog.answerTmdQuestions(data.tmdAnswers, questions);
  await dialog.expectConfirmEnabled(true);
}
