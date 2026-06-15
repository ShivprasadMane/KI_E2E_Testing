import type { Page } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';
import { getMatrixBondType } from '../data/create-application-matrix';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyTmdWrongAnswerWarningCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  const questions = await loadTmdQuestionsForPersona(page, row.persona);

  await dialog.selectFuneralBondType(getMatrixBondType(row));

  const wrongAnswer: 'yes' | 'no' =
    questions[0].answer.toLowerCase() === 'yes' ? 'no' : 'yes';
  await dialog.answerTmdQuestionAtIndex(0, wrongAnswer, questions);

  await dialog.expectWarningVisible();
  await dialog.expectConfirmEnabled(false);
}
