#!/usr/bin/env node
/**
 * Run funeral dashboard matrix rows with saved session (no B2C login per row).
 *
 *   npm run test:setup -- --project=setup-funeral   # once
 *   npm run test:matrix:funeral
 */
const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const playwrightArgs = [
  'test',
  '--project=matrix-funeral',
  ...args.filter((a) => !a.startsWith('--project=')),
];

const result = spawnSync('npx', ['playwright', ...playwrightArgs], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    MATRIX_PROJECT: 'keyinvest',
    MATRIX_PERSONA_FILTER: 'funeral',
    MATRIX_USE_SESSION: '1',
  },
});

process.exit(result.status ?? 1);
