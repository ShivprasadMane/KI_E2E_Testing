import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { MatrixRow } from '../data/matrix.types';

export async function executeReviewSummaryCapability(page: Page, _row: MatrixRow): Promise<void> {
  await expect(page.getByRole('heading', { name: /review summary/i })).toBeVisible({
    timeout: 60_000,
  });
}
