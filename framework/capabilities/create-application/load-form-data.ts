import type { Page } from '@playwright/test';
import type { MatrixRow } from '../../data/matrix.types';
import {
  getMatrixBondType,
  getMatrixDataRow,
  getMatrixDocumentSet,
} from '../../data/create-application-matrix';
import { setCreateApplicationContext } from '../../data/create-application-context';
import { loadCreateApplicationData } from '../../excel/read-create-application-data';
import { DEFAULT_CREATE_APPLICATION_EMAIL } from '../../../helpers/applications/create/default-email';
import { mapExcelRowToFormData } from '../../../helpers/applications/create/map-excel-to-form';
import { resolveMatrixPath } from '../../../projects/keyinvest/project.config';

export function resolveFormDataForRow(row: MatrixRow) {
  const matrixPath = resolveMatrixPath('keyinvest');
  const dataRow = getMatrixDataRow(row);

  if (dataRow) {
    try {
      return loadCreateApplicationData(matrixPath, dataRow);
    } catch {
      // Fall back to inline defaults when sheet row missing during bootstrap
    }
  }

  const bondType = getMatrixBondType(row);
  const documentSet = getMatrixDocumentSet(row);
  return mapExcelRowToFormData(dataRow || `${row.persona}-${bondType}`, row.raw, {
    bondType,
    documentSet,
    tmdAnswers: 'yes,no,no,no',
    email: DEFAULT_CREATE_APPLICATION_EMAIL,
  });
}

export function primeFormDataContext(page: Page, row: MatrixRow) {
  const data = resolveFormDataForRow(row);
  setCreateApplicationContext(page, { data });
  return data;
}
