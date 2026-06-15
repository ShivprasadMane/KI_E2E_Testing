import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ApplicationCreateDialogPage } from '../../pages/application-create-dialog.page';
import { ApplicationCreatePage } from '../../pages/application-create.page';
import { loadTmdQuestionsForPersona } from '../../helpers/applications/create/tmd.helper';
import { getMatrixScenario } from '../data/create-application-matrix';
import { loadValidationScenario } from '../excel/read-create-application-validation';
import { resolveMatrixPath } from '../../projects/keyinvest/project.config';
import type { MatrixRow } from '../data/matrix.types';

export async function executeRunCreateApplicationValidationCapability(
  page: Page,
  row: MatrixRow,
): Promise<void> {
  const scenario = getMatrixScenario(row);
  if (!scenario) {
    throw new Error(`Row ${row.caseNo}: scenario column is required for create-application-validation`);
  }

  const cases = loadValidationScenario(resolveMatrixPath('keyinvest'), scenario);
  if (cases.length === 0) {
    throw new Error(`Row ${row.caseNo}: no validation rows for scenario "${scenario}"`);
  }

  const dialog = new ApplicationCreateDialogPage(page, row.persona);
  const wizard = new ApplicationCreatePage(page, row.persona);
  const questions = await loadTmdQuestionsForPersona(page, row.persona);

  for (const testCase of cases) {
    if (testCase.step === 0) {
      if (testCase.field === 'tmdQ1' || testCase.testCase.toLowerCase().includes('wrong')) {
        const wrong: 'yes' | 'no' = testCase.inputValue.toLowerCase() === 'yes' ? 'yes' : 'no';
        await dialog.answerTmdQuestionAtIndex(0, wrong, questions);
        await dialog.expectWarningVisible();
        await dialog.expectConfirmEnabled(false);
      } else if (testCase.testCase.toLowerCase().includes('api')) {
        await dialog.expectQuestionsVisible(questions);
      } else if (testCase.testCase.toLowerCase().includes('no bond')) {
        await dialog.expectConfirmEnabled(false);
      }
      continue;
    }

    if (testCase.step === 1 && testCase.field === 'email') {
      const { resolveFormDataForRow } = await import('./create-application/load-form-data');
      await wizard.fillInvestorDetails({
        ...resolveFormDataForRow(row),
        email: testCase.inputValue || 'not-an-email',
      });
      await expect(page.getByText(/valid email|invalid/i).first()).toBeVisible({ timeout: 15_000 });
    }
  }
}
