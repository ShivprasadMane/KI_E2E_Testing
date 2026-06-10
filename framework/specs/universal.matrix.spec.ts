import path from 'path';
import { test } from '@playwright/test';
import { readTestMatrix } from '../excel/read-matrix';
import { getMatrixRowLabel, type MatrixRow } from '../data/matrix.types';
import { runMatrixRow } from '../matrix/run-matrix-row';
import { filterMatrixRows } from '../matrix/filter-matrix-rows';
import { resolveMatrixPath } from '../../projects/keyinvest/project.config';

const projectId = process.env.MATRIX_PROJECT ?? 'keyinvest';
const matrixPath = resolveMatrixPath(projectId);

const allRows = filterMatrixRows(readTestMatrix(matrixPath, { enabledOnly: true }));
const sessionLabel = process.env.MATRIX_USE_SESSION === '1' ? ' [session]' : '';

// eslint-disable-next-line no-console
console.log(
  `\n[matrix] ${projectId}${sessionLabel}: ${allRows.length} test(s) from ${path.basename(matrixPath)}\n`,
);

if (allRows.length === 0) {
  test(`[${projectId}] No enabled rows in matrix`, () => {
    throw new Error(
      `No enabled test rows in ${matrixPath}. Set Enabled = Y on at least one row.`,
    );
  });
} else {
  test.describe.configure({ mode: 'serial' });

  for (const row of allRows) {
    registerMatrixTest(row);
  }
}

function registerMatrixTest(row: MatrixRow): void {
  test(getMatrixRowLabel(row), async ({ page }) => {
    const result = await runMatrixRow(page, row);
    if (!result.passed) {
      throw new Error(result.error ?? `Matrix row ${row.caseNo} failed`);
    }
  });
}
