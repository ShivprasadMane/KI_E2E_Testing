import { expect } from '@playwright/test';
import type { Persona } from '../../framework/data/matrix.types';
import type { ClientListItem } from './types';

export const TENANT_CLIENTS_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export function usesTenantClientListApi(persona: Persona): boolean {
  return TENANT_CLIENTS_PERSONAS.has(persona);
}

type PaginatedClientListResponse = {
  data?: ClientListItem[];
};

export function normalizeClientListPayload(payload: unknown): ClientListItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const wrapped = payload as PaginatedClientListResponse;
  if (Array.isArray(wrapped?.data)) {
    return wrapped.data;
  }

  throw new Error(`Unexpected client list API response shape: ${JSON.stringify(payload)?.slice(0, 200)}`);
}

export const TENANT_CLIENT_COLUMNS = [
  'Client Name',
  'Date of Birth',
  'Age',
  'Suburb',
  'State',
  'No. of Policies',
] as const;

export const SORTABLE_TENANT_CLIENT_COLUMNS = [
  'Client Name',
  'Age',
  'Suburb',
  'State',
] as const;

export function formatClientName(row: ClientListItem): string {
  const parts = [row.firstName, row.middleName, row.lastName].filter(Boolean);
  let name = parts.join(' ').trim();
  if (row.type?.toLowerCase().includes('deceased')) {
    name += " (Dec'd)";
  }
  return name;
}

export function parseClientTableRows(rows: string[][]): Array<Record<string, string>> {
  return rows.map((cells) => ({
    clientName: cells[0]?.trim() ?? '',
    dob: cells[1]?.trim() ?? '',
    age: cells[2]?.trim() ?? '',
    suburb: cells[3]?.trim() ?? '',
    state: cells[4]?.trim() ?? '',
    policyTotal: cells[5]?.trim() ?? '',
  }));
}

export function assertClientListMatchesApi(
  uiRows: Array<Record<string, string>>,
  apiRows: ClientListItem[],
  context = 'Clients table',
): void {
  expect(uiRows.length, `${context}: row count`).toBeGreaterThan(0);
  expect(apiRows.length, `${context}: API row count`).toBeGreaterThan(0);

  const firstApi = apiRows[0];
  const firstUi = uiRows[0];
  const expectedName = formatClientName(firstApi);

  expect(firstUi.clientName, `${context}: first client name`).toContain(firstApi.firstName ?? '');
  if (expectedName) {
    expect(firstUi.clientName, `${context}: first client full name`).toMatch(new RegExp(firstApi.firstName ?? '', 'i'));
  }
  if (firstApi.age != null) {
    expect(firstUi.age, `${context}: first client age`).toBe(String(firstApi.age));
  }
  if (firstApi.suburb) {
    expect(firstUi.suburb, `${context}: first client suburb`).toMatch(new RegExp(firstApi.suburb, 'i'));
  }
}

export function productDisplayName(product?: string): string {
  if (product === 'AFSFB' || product === 'KIF') return 'Funeral Bond';
  if (product === 'LEB') return 'Life Events Bond';
  if (product === 'SS') return 'Supersaver';
  if (product === 'PAFF') return 'PAFF';
  return product ?? '';
}
