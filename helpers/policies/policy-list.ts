import { expect } from '@playwright/test';
import type { PolicyListItem } from './types';

/** Portfolio codes seen in the portal (F2005154, FW100039, L2001360, …). */
export const POLICY_NUMBER_PATTERN = /^(?:FW?\d{5,}|L\d{6,}|F\d{7,})$/i;

export function looksLikePolicyNumber(value: string): boolean {
  return POLICY_NUMBER_PATTERN.test(value.trim());
}

type PaginatedPolicyResponse = {
  data?: PolicyListItem[];
  meta?: { total?: number };
};

export function normalizePolicyListPayload(payload: unknown): PolicyListItem[] {
  if (Array.isArray(payload)) {
    return payload as PolicyListItem[];
  }

  const wrapped = payload as PaginatedPolicyResponse;
  if (Array.isArray(wrapped?.data)) {
    return wrapped.data;
  }

  throw new Error(`Unexpected policy list API response shape: ${JSON.stringify(payload)?.slice(0, 200)}`);
}

export function parsePolicyTableRows(
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

function matchPolicyUiRowToApi(
  uiRow: Record<string, string>,
  apiRows: PolicyListItem[],
): PolicyListItem | undefined {
  const rowText = Object.values(uiRow).join(' ');
  const policyNumber = uiRow['Policy Number']?.trim() ?? '';

  if (policyNumber && looksLikePolicyNumber(policyNumber)) {
    return apiRows.find((row) => row.portfoliocode === policyNumber);
  }

  for (const cell of Object.values(uiRow)) {
    if (looksLikePolicyNumber(cell)) {
      const byCode = apiRows.find((row) => row.portfoliocode === cell);
      if (byCode) return byCode;
    }
  }

  const policyName = uiRow['Policy Name']?.trim() ?? '';
  return apiRows.find((row) => {
    const code = row.portfoliocode?.trim();
    if (code && rowText.includes(code)) return true;
    const name = row.portfolioname?.trim();
    if (!name) return false;
    return rowText.includes(name) || policyName.includes(name.split(' ')[0] ?? '');
  });
}

export function assertPolicyListMatchesApi(
  uiRows: Array<Record<string, string>>,
  apiRows: PolicyListItem[],
  context = 'Policies table',
): void {
  expect(uiRows.length, `${context}: row count`).toBeGreaterThan(0);
  expect(apiRows.length, `${context}: API row count`).toBeGreaterThan(0);

  const matchedApi = matchPolicyUiRowToApi(uiRows[0], apiRows);
  expect(matchedApi, `${context}: first visible policy in API`).toBeDefined();

  const rowText = Object.values(uiRows[0]).join(' ').toLowerCase();
  if (matchedApi!.portfolioname) {
    expect(rowText, `${context}: policy name present in row`).toContain(
      matchedApi!.portfolioname.split(' ')[0]!.toLowerCase(),
    );
  }
}
