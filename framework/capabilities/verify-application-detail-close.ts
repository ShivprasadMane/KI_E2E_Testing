import type { Page } from '@playwright/test';
import { ApplicationDetailPage } from '../../pages/application-detail.page';
import { APPLICATIONS_SUPPORTED_PERSONAS } from '../../helpers/applications/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyApplicationDetailCloseCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!APPLICATIONS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Application Detail Close is not yet supported for persona "${row.persona}"`,
    );
  }

  const detail = new ApplicationDetailPage(page, row.persona);
  await detail.clickClose();
}
