import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { primarySignedDocument, queenslandDocument } from '../../helpers/applications/create/document-sets';
import { setCreateApplicationContext } from '../data/create-application-context';
import { getMatrixDocumentSet } from '../data/create-application-matrix';
import type { MatrixRow } from '../data/matrix.types';

export async function executeSubmitApplicationCapability(page: Page, row: MatrixRow): Promise<void> {
  const wizard = new ApplicationCreatePage(page, row.persona);
  const documentSet = getMatrixDocumentSet(row);
  const pdfPath = primarySignedDocument(documentSet);

  if (!page.url().includes('upload-signed-copy')) {
    await wizard.waitForStep('upload-signed-copy');
  }

  const result = await wizard.uploadSignAndSubmit(pdfPath, queenslandDocument(documentSet));
  expect(result.statusUpdateOk, 'Submit Application: PUT /application/update-status').toBe(true);
  expect(result.status, 'Submitted application status from API').toMatch(/APPROVED|SUBMITTED/i);

  const reference = result.displayId ?? result.applicationId;
  setCreateApplicationContext(page, {
    applicationId: result.applicationId,
    referenceId: reference,
  });
}
