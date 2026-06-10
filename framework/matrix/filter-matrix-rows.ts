import type { MatrixRow } from '../data/matrix.types';
import { parseWorkflow } from '../workflow/parse-workflow';
import { normalizeStepName } from '../capabilities/registry';

/** Funeral/adviser/admin dashboard flows that can reuse saved B2C session. */
export function filterMatrixRows(rows: MatrixRow[]): MatrixRow[] {
  const personaFilter = process.env.MATRIX_PERSONA_FILTER?.trim().toLowerCase();
  const sessionMode = process.env.MATRIX_USE_SESSION === '1';

  return rows.filter((row) => {
    if (personaFilter && row.persona !== personaFilter) {
      return false;
    }

    if (!sessionMode) {
      return true;
    }

    if (row.persona === 'guest' || row.expectedResult === 'validation_error') {
      return false;
    }

    const steps = parseWorkflow(row.workflow).map(normalizeStepName);
    const isLoginOnly = steps.length === 1 && steps[0] === 'login';
    if (isLoginOnly) {
      return false;
    }

    return row.persona === 'funeral';
  });
}
