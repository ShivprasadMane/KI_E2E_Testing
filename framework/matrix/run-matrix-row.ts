import type { Page } from '@playwright/test';
import {
  getCapability,
  listRegisteredCapabilities,
  normalizeStepName,
} from '../capabilities/registry';
import type { MatrixRow } from '../data/matrix.types';
import { parseWorkflow } from '../workflow/parse-workflow';

export type MatrixRowRunResult = {
  caseNo: string;
  passed: boolean;
  durationMs: number;
  error?: string;
};

export type RunMatrixRowOptions = {
  /** Skip Login steps — use after a persona has already authenticated. */
  skipLogin?: boolean;
};

export async function runMatrixRowSteps(
  page: Page,
  row: MatrixRow,
  options?: RunMatrixRowOptions,
): Promise<void> {
  const steps = parseWorkflow(row.workflow, row.persona);
  if (steps.length === 0) {
    throw new Error(`Row ${row.caseNo}: Workflow is empty`);
  }

  for (const step of steps) {
    if (options?.skipLogin && normalizeStepName(step) === 'login') {
      continue;
    }

    const capability = getCapability(step);
    if (!capability) {
      throw new Error(
        `Row ${row.caseNo}: Unknown workflow step "${step}". ` +
          `Registered: ${listRegisteredCapabilities().join(', ')}`,
      );
    }
    await capability(page, row);
  }
}

export async function runMatrixRow(
  page: Page,
  row: MatrixRow,
  options?: RunMatrixRowOptions,
): Promise<MatrixRowRunResult> {
  const start = Date.now();

  try {
    await runMatrixRowSteps(page, row, options);

    return {
      caseNo: row.caseNo,
      passed: true,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      caseNo: row.caseNo,
      passed: false,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
