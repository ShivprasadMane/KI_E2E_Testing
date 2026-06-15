import { parseCurrency } from './portfolio-summary';

/** Age bands rendered in EIPFrontEnd `comp/clientAge.tsx`. */
export const CLIENT_AGE_RANGES = [
  '<50',
  '50-59',
  '60-69',
  '70-79',
  '80-84',
  '85-89',
  '90-99',
  '100+',
] as const;

export type AgeRangeApiData = Record<string, { count: number; contributionSum: number }>;

export type ClientAgeRow = {
  ageRange: string;
  policies: number;
  balance: number;
};

export function buildExpectedClientAgeRows(data: AgeRangeApiData): ClientAgeRow[] {
  return CLIENT_AGE_RANGES.map((ageRange) => {
    const slice = data[ageRange];
    return {
      ageRange,
      policies: slice?.count ?? 0,
      balance: slice?.contributionSum ?? 0,
    };
  });
}

export function parseClientAgeTableRows(rows: string[][]): ClientAgeRow[] {
  return rows
    .map((cells) => ({
      ageRange: cells[0]?.trim() ?? '',
      policies: Number.parseInt(cells[1]?.trim() ?? '0', 10) || 0,
      balance: parseCurrency(cells[2] ?? '0'),
    }))
    .filter((row) => row.ageRange && CLIENT_AGE_RANGES.includes(row.ageRange as (typeof CLIENT_AGE_RANGES)[number]));
}

export function assertClientAgeRowsMatch(
  actual: ClientAgeRow[],
  expected: ClientAgeRow[],
  label = 'Client Age Distribution',
): void {
  for (const expectedRow of expected) {
    const uiRow = actual.find((row) => row.ageRange === expectedRow.ageRange);
    if (!uiRow) {
      throw new Error(`${label}: missing age band ${expectedRow.ageRange}`);
    }
    if (uiRow.policies !== expectedRow.policies) {
      throw new Error(
        `${label} ${expectedRow.ageRange} policies: UI=${uiRow.policies}, expected=${expectedRow.policies}`,
      );
    }
    if (Math.abs(uiRow.balance - expectedRow.balance) > 0.01) {
      throw new Error(
        `${label} ${expectedRow.ageRange} balance: UI=${uiRow.balance}, expected=${expectedRow.balance}`,
      );
    }
  }
}
