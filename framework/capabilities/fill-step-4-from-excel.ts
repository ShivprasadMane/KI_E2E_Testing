import type { Page } from '@playwright/test';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { primeFormDataContext } from './create-application/load-form-data';
import type { MatrixRow } from '../data/matrix.types';

export async function executeFillStep4FromExcelCapability(page: Page, row: MatrixRow): Promise<void> {
  const data = primeFormDataContext(page, row);
  const wizard = new ApplicationCreatePage(page, row.persona);
  await wizard.waitForStep('payment-details');
  await wizard.fillPaymentDetails(data);
  await wizard.saveAndProceedPaymentDetails();
}
