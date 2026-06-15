import type { Page } from '@playwright/test';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import type { MatrixRow } from '../data/matrix.types';

export async function executeAcceptDeclarationsCapability(page: Page, row: MatrixRow): Promise<void> {
  const wizard = new ApplicationCreatePage(page, row.persona);
  await wizard.acceptDeclarations();
}
