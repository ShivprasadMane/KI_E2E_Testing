import type { Page } from '@playwright/test';
import type { MatrixRow } from '../data/matrix.types';
import { executeLoginCapability } from './login';
import { executeOpenDashboardCapability } from './open-dashboard';
import { executeVerifyDashboardLinksCapability } from './verify-dashboard-links';
import { executeVerifyDashboardExportsCapability } from './verify-dashboard-exports';
import { executeVerifyPortfolioSummaryCapability } from './verify-portfolio-summary';
import { executeOpenRecentApplicationCapability } from './open-recent-application';
import { executeVerifySummaryDateFiltersCapability } from './verify-summary-date-filters';

export type CapabilityHandler = (page: Page, row: MatrixRow) => Promise<void>;

const REGISTRY: Record<string, CapabilityHandler> = {
  login: executeLoginCapability,
  'open dashboard': executeOpenDashboardCapability,
  'verify dashboard links': executeVerifyDashboardLinksCapability,
  'verify dashboard exports': executeVerifyDashboardExportsCapability,
  'verify portfolio summary': executeVerifyPortfolioSummaryCapability,
  'open recent application': executeOpenRecentApplicationCapability,
  'verify summary date filters': executeVerifySummaryDateFiltersCapability,
};

/** Tester-friendly aliases → canonical capability keys. */
const ALIASES: Record<string, string> = {
  login: 'login',
  dashboard: 'open dashboard',
  'open dashboard': 'open dashboard',
  'dashboard links': 'verify dashboard links',
  'verify dashboard links': 'verify dashboard links',
  'verify funeral dashboard links': 'verify dashboard links',
  'dashboard exports': 'verify dashboard exports',
  'verify dashboard exports': 'verify dashboard exports',
  'export dashboard reports': 'verify dashboard exports',
  'portfolio summary': 'verify portfolio summary',
  'verify portfolio summary': 'verify portfolio summary',
  'recent application': 'open recent application',
  'open recent application': 'open recent application',
  'view recent application': 'open recent application',
  'summary date filters': 'verify summary date filters',
  'verify summary date filters': 'verify summary date filters',
  'verify applications summary date filter': 'verify summary date filters',
  'verify claims summary date filter': 'verify summary date filters',
};

export function normalizeStepName(step: string): string {
  return step.trim().toLowerCase();
}

function resolveCanonicalStep(step: string): string {
  const normalized = normalizeStepName(step);
  return ALIASES[normalized] ?? normalized;
}

export function getCapability(step: string): CapabilityHandler | undefined {
  const canonical = resolveCanonicalStep(step);
  return REGISTRY[canonical];
}

export function listRegisteredCapabilities(): string[] {
  return [
    'Login',
    'Open Dashboard (or Dashboard)',
    'Verify Dashboard Links (funeral only)',
    'Verify Dashboard Exports (funeral, adviser, admin)',
    'Verify Portfolio Summary (funeral, adviser, admin)',
    'Open Recent Application (funeral, adviser, admin)',
    'Verify Summary Date Filters — Applications & Claims (funeral, adviser, admin)',
  ];
}
