import path from 'path';
import { test } from '@playwright/test';
import { installCountryStateBootstrap } from '../../helpers/applications/create/mock-country-state-api';
import { readTestMatrix } from '../excel/read-matrix';
import { getMatrixRowLabel } from '../data/matrix.types';
import { runMatrixRow } from '../matrix/run-matrix-row';
import { resolveMatrixPath } from '../../projects/keyinvest/project.config';

const projectId = process.env.MATRIX_PROJECT ?? 'keyinvest';
const matrixPath = resolveMatrixPath(projectId);

const CREATE_WORKFLOWS = new Set([
  'create-application-full',
  'create-application-tmd',
  'create-application-validation',
]);

const rows = readTestMatrix(matrixPath, { enabledOnly: true }).filter((row) =>
  CREATE_WORKFLOWS.has(row.workflow.trim().toLowerCase()),
);

test.describe.configure({ mode: 'serial', timeout: 900_000 });

// eslint-disable-next-line no-console
console.log(
  `\n[matrix-create-application] ${projectId}: ${rows.length} enabled row(s) from ${path.basename(matrixPath)}\n`,
);

if (rows.length === 0) {
  test(`[${projectId}] No enabled create-application rows`, () => {
    throw new Error(
      `No enabled create-application rows in ${matrixPath}. ` +
        `Run npm run matrix:generate and set Enabled=Y on TC-23+ rows.`,
    );
  });
}

for (const row of rows) {
  test(getMatrixRowLabel(row), async ({ page }) => {
    await installCountryStateBootstrap(page);
    const result = await runMatrixRow(page, row);
    if (!result.passed) {
      throw new Error(result.error ?? `Matrix row ${row.caseNo} failed`);
    }
  });
}
