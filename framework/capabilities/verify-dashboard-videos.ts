import type { Page } from '@playwright/test';
import { DashboardVideosPage } from '../../pages/dashboard-videos.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser']);

export async function executeVerifyDashboardVideosCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Dashboard Videos applies to funeral or adviser — not ${row.persona}`,
    );
  }

  const videos = new DashboardVideosPage(page, row.persona);
  await videos.verifyAllVideosOpen();
}
