import fs from 'fs';
import * as XLSX from 'xlsx';
import {
  hasEnabledColumn,
  hasWorkflowColumn,
  isEnabledValue,
  normalizeExpected,
  normalizePersona,
  TEST_MATRIX_SHEET_NAME,
  type MatrixRow,
} from '../data/matrix.types';

function normalizeHeader(header: string): string {
  return header.trim();
}

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

export function validateMatrixHeaders(headers: string[]): void {
  if (!hasWorkflowColumn(headers)) {
    throw new Error(
      `Excel sheet must include a "Workflow" column. Found: ${headers.filter(Boolean).join(', ')}`,
    );
  }
}

export function readTestMatrix(
  filePath: string,
  options?: { enabledOnly?: boolean },
): MatrixRow[] {
  const enabledOnly = options?.enabledOnly ?? true;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Test matrix file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheetName = workbook.SheetNames.includes(TEST_MATRIX_SHEET_NAME)
    ? TEST_MATRIX_SHEET_NAME
    : workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(`No sheets in workbook: ${filePath}`);
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
  }) as unknown[][];

  if (rows.length < 2) return [];

  const headers = (rows[0] as unknown[]).map((h) => normalizeHeader(String(h ?? '')));
  validateMatrixHeaders(headers.filter(Boolean));

  const enabledColumnPresent = hasEnabledColumn(headers.filter(Boolean));
  const parsed: MatrixRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i] as unknown[];
    if (!values?.length || values.every((v) => v === '' || v === null || v === undefined)) {
      continue;
    }

    const raw = rowToRecord(headers, values);
    const caseNo = getCell(raw, 'caseNo', 'CaseNo', 'TestId', 'Id');
    if (!caseNo) continue;

    const enabled = enabledColumnPresent
      ? isEnabledValue(getCell(raw, 'Enabled', 'Run'))
      : true;
    if (enabledOnly && !enabled) continue;

    const workflow = getCell(raw, 'Workflow');
    const personaRaw = getCell(raw, 'Persona');
    if (!personaRaw) {
      throw new Error(`Row ${caseNo}: Persona column is required`);
    }

    parsed.push({
      caseNo,
      enabled,
      workflow,
      persona: normalizePersona(personaRaw),
      username: getCell(raw, 'username', 'UserName', 'Username', 'Email'),
      password: getCell(raw, 'password', 'Password'),
      expectedResult: normalizeExpected(getCell(raw, 'expectedResult', 'Expected', 'Outcome')),
      raw,
    });
  }

  return parsed;
}
