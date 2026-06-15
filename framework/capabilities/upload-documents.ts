import type { Page } from '@playwright/test';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { primarySignedDocument, queenslandDocument } from '../../helpers/applications/create/document-sets';
import { getMatrixDocumentSet } from '../data/create-application-matrix';
import type { MatrixRow } from '../data/matrix.types';

export async function executeUploadDocumentsCapability(page: Page, row: MatrixRow): Promise<void> {
  const wizard = new ApplicationCreatePage(page, row.persona);
  await wizard.waitForStep('upload-signed-copy');
  await wizard.waitForUploadStepReady();

  const documentSet = getMatrixDocumentSet(row);
  const pdfPath = primarySignedDocument(documentSet);
  await wizard.uploadSignedApplicationIfNeeded(pdfPath);
  await wizard.uploadQueenslandDocumentIfNeeded(queenslandDocument(documentSet));
}
