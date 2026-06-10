import path from 'path';
import { test } from '@playwright/test';
import { readTestMatrix } from '../excel/read-matrix';
import { getMatrixRowLabel, type MatrixRow } from '../data/matrix.types';
import {
  getPersonaGroupLabel,
  orderedPersonaGroups,
  splitRowsByExpectedResult,
} from '../matrix/group-matrix-by-persona';
import { runPersonaGroup } from '../matrix/run-persona-group';
import { runMatrixRow } from '../matrix/run-matrix-row';
import { resolveMatrixPath } from '../../projects/keyinvest/project.config';

const projectId = process.env.MATRIX_PROJECT ?? 'keyinvest';
const matrixPath = resolveMatrixPath(projectId);
const allRows = readTestMatrix(matrixPath, { enabledOnly: true });

const validationRows = allRows.filter((row) => row.expectedResult === 'validation_error');
const successRows = allRows.filter((row) => row.expectedResult === 'success');
const personaGroups = orderedPersonaGroups(successRows);

// eslint-disable-next-line no-console
console.log(
  `\n[matrix-grouped] ${projectId}: ${personaGroups.length} persona group(s), ` +
    `${validationRows.length} negative row(s), ${allRows.length} total from ${path.basename(matrixPath)}\n`,
);

test.describe.configure({ mode: 'serial', timeout: 600_000 });

if (personaGroups.length === 0 && validationRows.length === 0) {
  test(`[${projectId}] No enabled rows in matrix`, () => {
    throw new Error(`No enabled test rows in ${matrixPath}. Set Enabled = Y on at least one row.`);
  });
}

for (const [persona, rows] of personaGroups) {
  registerPersonaGroupTest(persona, rows);
}

for (const row of validationRows) {
  registerValidationTest(row);
}

function registerPersonaGroupTest(persona: MatrixRow['persona'], rows: MatrixRow[]): void {
  test(getPersonaGroupLabel(persona, rows), async ({ page }) => {
    await runPersonaGroup(page, persona, rows);
  });
}

function registerValidationTest(row: MatrixRow): void {
  test(getMatrixRowLabel(row), async ({ page }) => {
    const result = await runMatrixRow(page, row);
    if (!result.passed) {
      throw new Error(result.error ?? `Matrix row ${row.caseNo} failed`);
    }
  });
}
