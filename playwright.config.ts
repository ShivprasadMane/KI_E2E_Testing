import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const portalUrl = process.env.PORTAL_URL ?? 'https://polite-plant-02b096d00.6.azurestaticapps.net';
const authDir = path.join(__dirname, '.auth');

export default defineConfig({
  testDir: '.',
  testMatch: [
    'tests/**/*.spec.ts',
    'setup/**/*.setup.ts',
    'framework/specs/universal.matrix.spec.ts',
    'framework/specs/universal.matrix-funeral.spec.ts',
    'framework/specs/universal.matrix-grouped.spec.ts',
    'framework/specs/universal.matrix-create-application.spec.ts',
  ],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 120_000,
  expect: { timeout: 30_000 },

  use: {
    baseURL: portalUrl,
    acceptDownloads: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 60_000,
    navigationTimeout: 90_000,
  },

  projects: [
    // ── Auth setup (run once, save session) ──────────────────────────────
    { name: 'setup-guest', testMatch: /setup\/auth\.guest\.setup\.ts/ },
    { name: 'setup-investor', testMatch: /setup\/auth\.investor\.setup\.ts/ },
    { name: 'setup-funeral', testMatch: /setup\/auth\.funeral\.setup\.ts/ },
    { name: 'setup-adviser', testMatch: /setup\/auth\.adviser\.setup\.ts/ },
    { name: 'setup-admin', testMatch: /setup\/auth\.admin\.setup\.ts/ },

    // ── Smoke (no auth) ─────────────────────────────────────────────────
    {
      name: 'smoke',
      testMatch: /tests\/smoke\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Fresh login tests (no saved session — runs real B2C/API login) ───
    {
      name: 'login',
      testMatch: /tests\/login\/.+\.spec\.ts/,
      timeout: 180_000,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Excel matrix (KeyInvest login rows from matrix.xlsx) ─────────────
    {
      name: 'matrix',
      testMatch: /framework\/specs\/universal\.matrix\.spec\.ts/,
      timeout: 180_000,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Excel matrix grouped by persona (1 login per role) ───────────────
    {
      name: 'matrix-grouped',
      testMatch: /framework\/specs\/universal\.matrix-grouped\.spec\.ts/,
      timeout: 600_000,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'matrix-create-application',
      testMatch: /framework\/specs\/universal\.matrix-create-application\.spec\.ts/,
      timeout: 900_000,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Excel matrix with saved funeral session (skips B2C login per row) ─
    {
      name: 'matrix-funeral',
      testMatch: /framework\/specs\/universal\.matrix-funeral\.spec\.ts/,
      timeout: 180_000,
      dependencies: ['setup-funeral'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'funeral-director.json'),
      },
    },

    // ── Persona tests (reuse saved auth) ────────────────────────────────
    {
      name: 'guest',
      testMatch: /tests\/guest\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'investor',
      testMatch: /tests\/investor\/.+\.spec\.ts/,
      dependencies: ['setup-investor'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'investor.json'),
      },
    },
    {
      name: 'funeral',
      testMatch: /tests\/funeral\/.+\.spec\.ts/,
      dependencies: ['setup-funeral'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'funeral-director.json'),
      },
    },
    {
      name: 'adviser',
      testMatch: /tests\/adviser\/.+\.spec\.ts/,
      dependencies: ['setup-adviser'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'financial-adviser.json'),
      },
    },
    {
      name: 'admin',
      testMatch: /tests\/admin\/.+\.spec\.ts/,
      dependencies: ['setup-admin'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'admin.json'),
      },
    },
  ],
});
