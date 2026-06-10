#!/usr/bin/env node
/**
 * Run Excel matrix grouped by persona — one login per role, then all rows for that role.
 *
 *   npm run test:matrix:grouped
 *   npm run test:matrix:grouped -- --headed
 */
const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const projectArg = args.find((a) => a.startsWith('--project='));
const project = projectArg
  ? projectArg.split('=').slice(1).join('=').trim()
  : 'keyinvest';

const playwrightArgs = [
  'test',
  '--project=matrix-grouped',
  ...args.filter((a) => !a.startsWith('--project=')),
];

const result = spawnSync('npx', ['playwright', ...playwrightArgs], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    MATRIX_PROJECT: project,
  },
});

process.exit(result.status ?? 1);
