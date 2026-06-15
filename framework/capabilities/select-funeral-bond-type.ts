import type { Page } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { getMatrixBondType } from '../data/create-application-matrix';
import { primeFormDataContext } from './create-application/load-form-data';
import type { MatrixRow } from '../data/matrix.types';

export async function executeSelectFuneralBondTypeCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const data = primeFormDataContext(page, row);
  const bondType = getMatrixBondType(row) || data.bondType;
  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  if (row.persona === 'adviser' && !(await dialog.hasFuneralBondSubtypeStep())) {
    return;
  }
  await dialog.selectFuneralBondType(bondType);
}
