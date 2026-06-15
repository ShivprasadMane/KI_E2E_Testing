import { test } from '@playwright/test';
import { ApplicationsPage } from '../../pages/applications.page';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { primarySignedDocument } from '../../helpers/applications/create/document-sets';
import { DEFAULT_CREATE_APPLICATION_EMAIL } from '../../helpers/applications/create/default-email';
import { mapExcelRowToFormData } from '../../helpers/applications/create/map-excel-to-form';

test.describe('Funeral Director create application full flow @funeral @create-application', () => {
  test('PREPAID funeral bond through submit', async ({ page }) => {
    const data = mapExcelRowToFormData('PREPAID-FUNERAL-01', {
      bondType: 'PREPAID',
      tmdAnswers: 'yes,no,no,no',
      email: DEFAULT_CREATE_APPLICATION_EMAIL,
    });

    const applications = new ApplicationsPage(page, 'funeral');
    await applications.open();

    const dialog = new ApplicationCreateDialogPage(page, 'funeral');
    await dialog.clickCreateNewOnApplications();
    await dialog.completeTmdAndCreate(data.bondType, data.tmdAnswers);

    const wizard = new ApplicationCreatePage(page, 'funeral');
    const pdf = primarySignedDocument('default-docs');
    const result = await wizard.completeWizardFromExcel(data, pdf, { saveUnsignedPdf: true });
    console.log('[create-application] submit result:', result);
  });
});
