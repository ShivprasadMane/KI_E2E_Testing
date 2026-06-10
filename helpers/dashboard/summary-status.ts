import { parseCurrency } from './portfolio-summary';

export type ApplicationStatusCount = {
  submittedApplications: number;
  submittedContribution: number;
  approvedApplications: number;
  approvedContribution: number;
  rejectedApplications: number;
  rejectedContribution: number;
  settledApplications: number;
  settledContribution: number;
  draftApplications: number;
  draftContribution: number;
};

export type ClaimStatusCount = {
  submittedClaims: number;
  submittedAmount: number;
  approvedClaims: number;
  approvedAmount: number;
  rejectedClaims: number;
  rejectedAmount: number;
  settledClaims: number;
  settledAmount: number;
};

export type SummaryStatusRow = {
  status: string;
  count: number;
  amount: number;
};

export function applicationStatusToRows(data: ApplicationStatusCount): SummaryStatusRow[] {
  return [
    { status: 'Submitted', count: data.submittedApplications ?? 0, amount: Number(data.submittedContribution ?? 0) },
    { status: 'Approved', count: data.approvedApplications ?? 0, amount: Number(data.approvedContribution ?? 0) },
    { status: 'Rejected', count: data.rejectedApplications ?? 0, amount: Number(data.rejectedContribution ?? 0) },
    { status: 'Settled', count: data.settledApplications ?? 0, amount: Number(data.settledContribution ?? 0) },
    { status: 'Draft', count: data.draftApplications ?? 0, amount: Number(data.draftContribution ?? 0) },
  ];
}

export function claimStatusToRows(data: ClaimStatusCount): SummaryStatusRow[] {
  return [
    { status: 'Submitted', count: data.submittedClaims ?? 0, amount: Number(data.submittedAmount ?? 0) },
    { status: 'Approved', count: data.approvedClaims ?? 0, amount: Number(data.approvedAmount ?? 0) },
    { status: 'Rejected', count: data.rejectedClaims ?? 0, amount: Number(data.rejectedAmount ?? 0) },
    { status: 'Settled', count: data.settledClaims ?? 0, amount: Number(data.settledAmount ?? 0) },
  ];
}

export function parseSummaryTableRows(
  tableRows: string[][],
): SummaryStatusRow[] {
  return tableRows.map(([status, count, amountText]) => ({
    status,
    count: Number.parseInt(count, 10) || 0,
    amount: parseCurrency(amountText),
  }));
}

export function assertSummaryRowsMatch(
  actual: SummaryStatusRow[],
  expected: SummaryStatusRow[],
  label: string,
): void {
  if (actual.length !== expected.length) {
    throw new Error(`${label}: expected ${expected.length} rows, got ${actual.length}`);
  }

  for (const expectedRow of expected) {
    const row = actual.find((r) => r.status === expectedRow.status);
    if (!row) {
      throw new Error(`${label}: missing status row "${expectedRow.status}"`);
    }
    if (row.count !== expectedRow.count) {
      throw new Error(
        `${label} ${expectedRow.status} count: UI=${row.count}, expected=${expectedRow.count}`,
      );
    }
    if (Math.abs(row.amount - expectedRow.amount) > 0.01) {
      throw new Error(
        `${label} ${expectedRow.status} amount: UI=${row.amount}, expected=${expectedRow.amount}`,
      );
    }
  }
}
