#!/usr/bin/env node
/**
 * Preflight validator — checks every workflow step in the Excel matrix against
 * registered capabilities BEFORE opening a browser.
 *
 * Catches typos, unknown step names, and empty workflows early.
 *
 * Usage:
 *   npm run validate:matrix                       check all rows
 *   npm run validate:matrix -- --enabled-only     check only rows with Enabled=Y
 *   npm run validate:matrix -- --matrix=path/to/matrix.xlsx
 */
import path from 'path';
import { readTestMatrix } from '../framework/excel/read-matrix';
import { parseWorkflow } from '../framework/workflow/parse-workflow';
import { getCapability, listRegisteredCapabilities } from '../framework/capabilities/registry';
import { resolveMatrixPath } from '../projects/keyinvest/project.config';
import { NAMED_WORKFLOWS } from '../framework/workflow/workflow-definitions';

const args = process.argv.slice(2);
const matrixArg = args.find((a) => a.startsWith('--matrix='));
const enabledOnly = args.includes('--enabled-only');

const matrixPath = matrixArg
  ? path.resolve(matrixArg.split('=').slice(1).join('='))
  : resolveMatrixPath('keyinvest');

const scopeLabel = enabledOnly ? '(enabled rows only)' : '(all rows incl. disabled)';
console.log(`\n[validate-matrix] ${path.basename(matrixPath)} ${scopeLabel}\n`);

const rows = readTestMatrix(matrixPath, { enabledOnly });

if (rows.length === 0) {
  console.warn('  No rows found — check that the matrix file exists and has data.\n');
  process.exit(0);
}

const errors: string[] = [];

for (const row of rows) {
  const tag = row.enabled ? '' : ' [disabled]';
    const steps = parseWorkflow(row.workflow, row.persona);

  if (steps.length === 0) {
    errors.push(`  Row ${row.caseNo}${tag} (${row.persona}): Workflow column is empty`);
    continue;
  }

  for (const step of steps) {
    if (!getCapability(step)) {
      errors.push(
        `  Row ${row.caseNo}${tag} (${row.persona}): Unknown step "${step}"` +
          (row.workflow.trim().toLowerCase() !== step.toLowerCase()
            ? ` — in workflow "${row.workflow}"`
            : ''),
      );
    }
  }
}

const enabledCount = rows.filter((r) => r.enabled).length;
const disabledCount = rows.filter((r) => !r.enabled).length;

if (errors.length === 0) {
  console.log(
    `  OK  ${rows.length} row(s) checked — ${enabledCount} enabled, ${disabledCount} disabled\n`,
  );
  process.exit(0);
}

console.error(`  ${errors.length} error(s) found:\n`);
for (const e of errors) {
  console.error(e);
}

console.error('\n  Registered capabilities:');
for (const cap of listRegisteredCapabilities()) {
  console.error(`    - ${cap}`);
}

console.error('\n  Named workflow shortcuts (use these in the Workflow column):');
for (const [name, chain] of Object.entries(NAMED_WORKFLOWS)) {
  console.error(`    ${name.padEnd(20)} →  ${chain}`);
}

console.error('');
process.exit(1);
