import type { Page } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { setCreateApplicationContext } from '../data/create-application-context';
import { getMatrixBondType } from '../data/create-application-matrix';
import { primeFormDataContext } from './create-application/load-form-data';
import type { MatrixRow } from '../data/matrix.types';

export async function executeConfirmCreateApplicationCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const data = primeFormDataContext(page, row);
  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  const applicationId = await dialog.completeTmdAndCreate(getMatrixBondType(row), data.tmdAnswers);
  setCreateApplicationContext(page, { applicationId, data });
}
