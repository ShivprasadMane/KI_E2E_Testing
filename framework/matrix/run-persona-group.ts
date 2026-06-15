import type { Page } from '@playwright/test';
import { executeLoginCapability } from '../capabilities/login';
import { normalizeStepName } from '../capabilities/registry';
import type { MatrixRow, Persona } from '../data/matrix.types';
import { splitRowsByExpectedResult } from './group-matrix-by-persona';
import { runMatrixRowSteps } from './run-matrix-row';
import { parseWorkflow } from '../workflow/parse-workflow';

function isLoginOnlyRow(row: MatrixRow): boolean {
  const steps = parseWorkflow(row.workflow, row.persona).map(normalizeStepName);
  return steps.length === 1 && steps[0] === 'login';
}

/**
 * Login once for a persona, then run every success Excel row (skipping repeated Login steps).
 * Negative rows (validation_error) must be run separately with a fresh browser context.
 */
export async function runPersonaGroup(page: Page, persona: Persona, rows: MatrixRow[]): Promise<void> {
  const { success } = splitRowsByExpectedResult(rows);
  if (success.length === 0) {
    return;
  }

  const loginRow = success[0];
  await executeLoginCapability(page, loginRow);

  for (const row of success) {
    if (row.caseNo === loginRow.caseNo && isLoginOnlyRow(row)) {
      continue;
    }

    try {
      await runMatrixRowSteps(page, row, { skipLogin: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Row ${row.caseNo} (${persona}): ${message}`);
    }
  }
}
