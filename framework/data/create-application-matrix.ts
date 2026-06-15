import type { MatrixRow } from './matrix.types';
import { normalizeFuneralBondType, type FuneralBondType } from '../../helpers/applications/create/bond-types';

export const CREATE_APPLICATION_DATA_SHEET = 'CreateApplicationData';
export const CREATE_APPLICATION_VALIDATION_SHEET = 'CreateApplicationValidation';

function rawCell(row: MatrixRow, ...keys: string[]): string {
  for (const key of keys) {
    const direct = row.raw[key];
    if (direct !== undefined && direct !== '') return direct.trim();
    const found = Object.entries(row.raw).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (found && found[1] !== '') return found[1].trim();
  }
  return '';
}

export function getMatrixDataRow(row: MatrixRow): string {
  return rawCell(row, 'dataRow', 'DataRow');
}

export function getMatrixBondType(row: MatrixRow): FuneralBondType {
  const value = rawCell(row, 'bondType', 'BondType') || 'PREPAID';
  return normalizeFuneralBondType(value);
}

export function getMatrixScenario(row: MatrixRow): string {
  return rawCell(row, 'scenario', 'Scenario', 'scenarioId');
}

export function getMatrixDocumentSet(row: MatrixRow): string {
  return rawCell(row, 'documentSet', 'DocumentSet') || 'default-docs';
}
