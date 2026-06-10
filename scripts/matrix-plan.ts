import path from 'path';
import dotenv from 'dotenv';
import { readTestMatrix } from '../framework/excel/read-matrix';
import { getMatrixRowLabel } from '../framework/data/matrix.types';
import { resolveMatrixPath } from '../projects/keyinvest/project.config';

dotenv.config();

const projectId = process.argv[2] ?? process.env.MATRIX_PROJECT ?? 'keyinvest';
const matrixPath = resolveMatrixPath(projectId);
const rows = readTestMatrix(matrixPath, { enabledOnly: true });

console.log(`\nMatrix plan: ${projectId}`);
console.log(`File: ${matrixPath}`);
console.log(`Enabled rows: ${rows.length}\n`);

if (rows.length === 0) {
  console.log('  (no enabled rows)');
  process.exit(0);
}

for (const row of rows) {
  const creds =
    row.username && row.password
      ? `excel:${row.username}`
      : row.persona === 'guest'
        ? 'none'
        : 'env';
  console.log(
    `  ${getMatrixRowLabel(row)} | workflow=${row.workflow} | expected=${row.expectedResult} | creds=${creds}`,
  );
}

console.log('');
