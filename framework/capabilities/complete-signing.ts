import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { queenslandDocument } from '../../helpers/applications/create/document-sets';
import { getMatrixDocumentSet } from '../data/create-application-matrix';
import type { MatrixRow } from '../data/matrix.types';

export async function executeCompleteSigningCapability(page: Page, row: MatrixRow): Promise<void> {
  const wizard = new ApplicationCreatePage(page, row.persona);
  await wizard.waitForUploadStepReady();
  await wizard.uploadQueenslandDocumentIfNeeded(queenslandDocument(getMatrixDocumentSet(row)));
  await wizard.confirmUploadCheckboxes();

  const initiateButton = page.getByRole('button', { name: /initiate digital signature/i });
  if (await initiateButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await expect(page.getByRole('button', { name: /submit application/i })).toBeEnabled({
      timeout: 120_000,
    });
  }
}
