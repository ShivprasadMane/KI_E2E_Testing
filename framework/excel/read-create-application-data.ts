import fs from 'fs';
import * as XLSX from 'xlsx';
import { CREATE_APPLICATION_DATA_SHEET } from '../data/create-application-matrix';
import type { CreateApplicationFormData } from '../../helpers/applications/create/form-data.types';
import { mapExcelRowToFormData } from '../../helpers/applications/create/map-excel-to-form';

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

export function readCreateApplicationData(filePath: string): Map<string, CreateApplicationFormData> {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const workbook = XLSX.readFile(filePath, { cellDates: false });
  if (!workbook.SheetNames.includes(CREATE_APPLICATION_DATA_SHEET)) {
    return new Map();
  }

  const sheet = workbook.Sheets[CREATE_APPLICATION_DATA_SHEET];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' }) as unknown[][];

  if (rows.length < 2) return new Map();

  const headers = (rows[0] as unknown[]).map((h) => String(h ?? '').trim());
  const result = new Map<string, CreateApplicationFormData>();

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i] as unknown[];
    if (!values?.length || values.every((v) => v === '' || v === null || v === undefined)) {
      continue;
    }
    const raw = rowToRecord(headers, values);
    const dataRow = getCell(raw, 'dataRow', 'DataRow');
    if (!dataRow) continue;
    result.set(dataRow, mapExcelRowToFormData(dataRow, raw));
  }

  return result;
}

export function loadCreateApplicationData(
  filePath: string,
  dataRow: string,
): CreateApplicationFormData {
  const map = readCreateApplicationData(filePath);
  const data = map.get(dataRow);
  if (!data) {
    throw new Error(
      `CreateApplicationData row "${dataRow}" not found in ${filePath}. ` +
        `Available: ${[...map.keys()].join(', ') || '(none)'}`,
    );
  }
  return data;
}
