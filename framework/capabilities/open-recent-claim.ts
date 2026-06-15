import type { Page } from '@playwright/test';
import { assertDashboardLoaded } from '../../pages/dashboard.page';
import { RecentClaimsPage } from '../../pages/recent-claims.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeOpenRecentClaimCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Open Recent Claim applies to funeral or adviser — not ${row.persona}`,
    );
  }

  const recentClaims = new RecentClaimsPage(page);
  await recentClaims.openFirstClaimView();

  // Return to dashboard so full workflows can continue (e.g. Open Recent Application).
  await page.goto('/adviser/dashboard');
  await assertDashboardLoaded(page, row.persona);
}
