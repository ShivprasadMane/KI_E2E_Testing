/** Mirrors EIPFrontEnd `investment_Summary.tsx` + `/application/counts` API shape. */
export type ApplicationCountSlice = {
  totalApplications?: number;
  totalContribution?: number;
  nominatedApplications?: number;
  nominatedContribution?: number;
  prepaidApplications?: number;
  prepaidContribution?: number;
  supersaverApplications?: number;
  supersaverContribution?: number;
  preArrangedApplications?: number;
  preArrangedContribution?: number;
  lebApplications?: number;
  lebContribution?: number;
};

export type PortfolioSummaryRow = {
  product: string;
  policies: number;
  amount: number;
  subRows?: PortfolioSummaryRow[];
};

export type PortfolioSummaryTable = {
  rows: PortfolioSummaryRow[];
  total: { policies: number; amount: number };
};

export function parseCurrency(value: string): number {
  const normalized = value.replace(/[$,\s]/g, '');
  const amount = parseFloat(normalized);
  return Number.isNaN(amount) ? 0 : amount;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Build expected dashboard rows from `/application/counts` response. */
export function buildExpectedPortfolioSummary(counts: ApplicationCountSlice[]): PortfolioSummaryTable {
  const topLevelRows: PortfolioSummaryRow[] = [
    {
      product: 'Funeral Bond',
      policies: counts[0]?.totalApplications ?? 0,
      amount: Number(counts[0]?.totalContribution ?? 0),
      subRows: [
        {
          product: 'Nominated Funeral Bond',
          policies: counts[1]?.nominatedApplications ?? 0,
          amount: Number(counts[1]?.nominatedContribution ?? 0),
        },
        {
          product: 'Prepaid Funeral Bond',
          policies: counts[2]?.prepaidApplications ?? 0,
          amount: Number(counts[2]?.prepaidContribution ?? 0),
        },
      ],
    },
    {
      product: 'Pre Arranged Funeral Fund',
      policies: counts[4]?.preArrangedApplications ?? 0,
      amount: Number(counts[4]?.preArrangedContribution ?? 0),
    },
    {
      product: 'Supersaver',
      policies: counts[3]?.supersaverApplications ?? 0,
      amount: Number(counts[3]?.supersaverContribution ?? 0),
    },
  ];

  return {
    rows: topLevelRows,
    total: calculatePortfolioTotals(topLevelRows),
  };
}

/** Build expected rows for financial adviser dashboard (`financialAdviser/investment_Summary.tsx`). */
export function buildExpectedAdviserPortfolioSummary(counts: ApplicationCountSlice[]): PortfolioSummaryTable {
  const topLevelRows: PortfolioSummaryRow[] = [
    {
      product: 'Life Events Bond',
      policies: counts[5]?.lebApplications ?? 0,
      amount: Number(counts[5]?.lebContribution ?? 0),
    },
    {
      product: 'Funeral Bond',
      policies: counts[0]?.totalApplications ?? 0,
      amount: Number(counts[0]?.totalContribution ?? 0),
    },
    {
      product: 'Pre Arranged Funeral Fund',
      policies: counts[4]?.preArrangedApplications ?? 0,
      amount: Number(counts[4]?.preArrangedContribution ?? 0),
    },
    {
      product: 'Supersaver',
      policies: counts[3]?.supersaverApplications ?? 0,
      amount: Number(counts[3]?.supersaverContribution ?? 0),
    },
  ];

  return {
    rows: topLevelRows,
    total: calculatePortfolioTotals(topLevelRows),
  };
}

/** Total row sums top-level products only (sub-rows are informational). */
export function calculatePortfolioTotals(topLevelRows: PortfolioSummaryRow[]): {
  policies: number;
  amount: number;
} {
  const policies = topLevelRows.reduce((sum, row) => sum + row.policies, 0);
  const amount = topLevelRows.reduce((sum, row) => {
    const value = Number(row.amount);
    return Number.isNaN(value) ? sum : sum + value;
  }, 0);

  return { policies, amount };
}

export function flattenPortfolioRows(table: PortfolioSummaryTable): PortfolioSummaryRow[] {
  const flat: PortfolioSummaryRow[] = [];
  for (const row of table.rows) {
    flat.push(row);
    if (row.subRows) {
      flat.push(...row.subRows);
    }
  }
  flat.push({
    product: 'Total',
    policies: table.total.policies,
    amount: table.total.amount,
  });
  return flat;
}
