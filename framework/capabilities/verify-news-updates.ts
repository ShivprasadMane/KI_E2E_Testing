import type { Page } from '@playwright/test';
import { NewsUpdatesPage } from '../../pages/news-updates.page';
import type { MatrixRow, Persona } from '../data/matrix.types';

const SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser', 'investor']);

export async function executeVerifyNewsUpdatesCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify News And Updates applies to funeral, adviser, or investor — not ${row.persona}`,
    );
  }

  const news = new NewsUpdatesPage(page, row.persona);
  await news.verifyNewsWidget();
}
