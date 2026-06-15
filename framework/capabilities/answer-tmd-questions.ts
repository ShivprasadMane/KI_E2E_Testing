import type { Page } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { primeFormDataContext } from './create-application/load-form-data';
import type { MatrixRow } from '../data/matrix.types';

export async function executeAnswerTmdQuestionsCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const data = primeFormDataContext(page, row);
  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  if (row.persona === 'adviser' && !(await dialog.hasFuneralBondSubtypeStep())) {
    await dialog.confirmAdviserDeclarationIfShown();
    return;
  }
  await dialog.answerTmdQuestions(data.tmdAnswers);
}
