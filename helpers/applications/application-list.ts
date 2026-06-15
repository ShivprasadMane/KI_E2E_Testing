import { expect } from '@playwright/test';
import type { ApplicationListItem } from './types';

type WrappedApplicationListResponse = {
  data?: ApplicationListItem[];
};

export function normalizeApplicationListPayload(payload: unknown): ApplicationListItem[] {
  if (Array.isArray(payload)) {
    return payload as ApplicationListItem[];
  }

  const wrapped = payload as WrappedApplicationListResponse;
  if (Array.isArray(wrapped?.data)) {
    return wrapped.data;
  }

  throw new Error(`Unexpected application list API response shape: ${JSON.stringify(payload)?.slice(0, 200)}`);
}

export function parseApplicationTableRows(
  rows: string[][],
  columns: readonly string[],
): Array<Record<string, string>> {
  return rows.map((cells) => {
    const record: Record<string, string> = {};
    columns.forEach((column, index) => {
      record[column] = cells[index]?.trim() ?? '';
    });
    return record;
  });
}

function applicationIdFromApiRow(row: ApplicationListItem): string {
  return String(row.id ?? '');
}

function applicationDisplayIdFromApiRow(row: ApplicationListItem): string {
  return row.displayId ?? applicationIdFromApiRow(row);
}

function matchApplicationUiRowToApi(
  uiRow: Record<string, string>,
  apiRows: ApplicationListItem[],
): ApplicationListItem | undefined {
  const rowText = Object.values(uiRow).join(' ');
  const idCell = (uiRow.Id ?? uiRow['Application ID'] ?? '').trim();
  const applicantName = uiRow['Applicant Name']?.trim() ?? '';

  if (idCell) {
    const byId = apiRows.find(
      (row) => applicationDisplayIdFromApiRow(row) === idCell || applicationIdFromApiRow(row) === idCell,
    );
    if (byId) return byId;
  }

  return apiRows.find((row) => {
    const displayId = applicationDisplayIdFromApiRow(row);
    if (displayId && rowText.includes(displayId)) return true;
    const owner = row.owner?.trim();
    if (!owner) return false;
    const firstName = owner.split(' ')[0] ?? '';
    return rowText.includes(owner) || applicantName.includes(firstName);
  });
}

function isPopulatedUiRow(uiRow: Record<string, string>): boolean {
  const text = Object.values(uiRow).join(' ').trim();
  return text.length > 2 && !/^no records/i.test(text);
}

export function assertApplicationListMatchesApi(
  uiRows: Array<Record<string, string>>,
  apiRows: ApplicationListItem[],
  context = 'Applications table',
): void {
  const populatedRows = uiRows.filter(isPopulatedUiRow);
  expect(populatedRows.length, `${context}: populated row count`).toBeGreaterThan(0);
  expect(apiRows.length, `${context}: API row count`).toBeGreaterThan(0);

  let matchedUi: Record<string, string> | undefined;
  let matchedApi: ApplicationListItem | undefined;

  for (const uiRow of populatedRows) {
    const apiMatch = matchApplicationUiRowToApi(uiRow, apiRows);
    if (apiMatch) {
      matchedUi = uiRow;
      matchedApi = apiMatch;
      break;
    }
  }

  expect(matchedApi, `${context}: visible application in API`).toBeDefined();

  const rowText = Object.values(matchedUi!).join(' ').toLowerCase();
  if (matchedApi!.owner) {
    expect(rowText, `${context}: applicant name present in row`).toContain(
      matchedApi!.owner.split(' ')[0]!.toLowerCase(),
    );
  }
}
