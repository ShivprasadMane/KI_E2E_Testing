import fs from 'fs';
import * as XLSX from 'xlsx';
import { CREATE_APPLICATION_VALIDATION_SHEET } from '../data/create-application-matrix';
import type { CreateApplicationValidationRow } from '../../helpers/applications/create/form-data.types';

function rowToRecord(headers: string[], values: unknown[]): Record<string, string> {
  const raw: Record<string, string> = {};
  headers.forEach((header, i) => {
    if (!header) return;
    const cell = values[i];
    raw[header] = cell === undefined || cell === null ? '' : String(cell).trim();
  });
  return raw;
}

function getCell(raw: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = raw[key];
    if (direct !== undefined && direct !== '') return direct;
    const found = Object.entries(raw).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (found && found[1] !== '') return found[1];
  }
  return '';
}

export function readCreateApplicationValidation(filePath: string): CreateApplicationValidationRow[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const workbook = XLSX.readFile(filePath, { cellDates: false });
  if (!workbook.SheetNames.includes(CREATE_APPLICATION_VALIDATION_SHEET)) {
    return [];
  }

  const sheet = workbook.Sheets[CREATE_APPLICATION_VALIDATION_SHEET];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' }) as unknown[][];

  if (rows.length < 2) return [];

  const headers = (rows[0] as unknown[]).map((h) => String(h ?? '').trim());
  const result: CreateApplicationValidationRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i] as unknown[];
    if (!values?.length || values.every((v) => v === '' || v === null || v === undefined)) {
      continue;
    }
    const raw = rowToRecord(headers, values);
    const scenarioId = getCell(raw, 'scenarioId', 'ScenarioId', 'scenario');
    if (!scenarioId) continue;

    result.push({
      scenarioId,
      bondType: getCell(raw, 'bondType', 'BondType'),
      step: Number(getCell(raw, 'step', 'Step') || '0'),
      testCase: getCell(raw, 'testCase', 'TestCase'),
      field: getCell(raw, 'field', 'Field'),
      inputValue: getCell(raw, 'inputValue', 'InputValue'),
      expectedError: getCell(raw, 'expectedError', 'ExpectedError'),
      persona: getCell(raw, 'persona', 'Persona'),
    });
  }

  return result;
}

export function loadValidationScenario(
  filePath: string,
  scenarioId: string,
): CreateApplicationValidationRow[] {
  return readCreateApplicationValidation(filePath).filter((r) => r.scenarioId === scenarioId);
}
