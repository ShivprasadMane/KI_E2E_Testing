import type { Page } from '@playwright/test';
import { ApplicationDetailPage } from '../../pages/application-detail.page';
import { APPLICATIONS_SUPPORTED_PERSONAS } from '../../helpers/applications/types';
import type { MatrixRow } from '../data/matrix.types';

export async function executeVerifyApplicationDetailCommentsCapability(page: Page, row: MatrixRow): Promise<void> {
  if (!APPLICATIONS_SUPPORTED_PERSONAS.has(row.persona)) {
    throw new Error(
      `Row ${row.caseNo}: Verify Application Detail Comments is not yet supported for persona "${row.persona}"`,
    );
  }

  const match = page.url().match(/\/application\/view\/([^/?#]+)/);
  if (!match?.[1]) {
    throw new Error(
      `Row ${row.caseNo}: Expected to be on application detail page before Verify Application Detail Comments`,
    );
  }

  const detail = new ApplicationDetailPage(page, row.persona);
  await detail.verifyComments(match[1]);
}
