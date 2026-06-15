import type { Page } from '@playwright/test';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { primeFormDataContext } from './create-application/load-form-data';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyReviewFromExcelCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const data = primeFormDataContext(page, row);
  const wizard = new ApplicationCreatePage(page, row.persona);
  await wizard.verifyReviewSummary(data);
  await wizard.proceedReviewToUpload();
}
