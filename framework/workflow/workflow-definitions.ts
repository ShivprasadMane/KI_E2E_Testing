import type { Persona } from '../data/matrix.types';

/**
 * Named workflow shortcuts for the Excel Workflow column.
 * Use the key (e.g. "dashboard-full") in Excel instead of typing the full step chain.
 * All names are matched case-insensitively.
 *
 * Default Excel matrix uses only `dashboard-full` (one row per persona).
 * Granular shortcuts below stay available — add a row in Excel and set Enabled=Y to run one feature.
 */
const FUNERAL_DASHBOARD_FULL =
  'Login > Open Dashboard > Verify Dashboard Links > Verify Portfolio Summary > Verify Client Age Distribution > Verify Dashboard Exports > Verify Summary Date Filters > Verify News And Updates > Verify Dashboard Videos > Open Recent Claim > Open Recent Application';

const ADVISER_DASHBOARD_FULL =
  'Login > Open Dashboard > Verify Adviser Dashboard Links > Verify Portfolio Summary > Verify Client Age Distribution > Verify Adviser Widgets > Verify Dashboard Exports > Verify Summary Date Filters > Verify News And Updates > Verify Dashboard Videos > Open Recent Claim > Open Recent Application';

const INVESTOR_DASHBOARD_FULL =
  'Login > Open Dashboard > Verify Investor Dashboard Links > Verify Investor Dashboard > Verify News And Updates';

const ADMIN_DASHBOARD_FULL =
  'Login > Open Dashboard > Verify Admin Dashboard > Verify Admin Dashboard Exports';

const TENANT_CLIENTS_FULL =
  'Login > Open Clients > Verify Clients Table > Verify Clients Search > Verify Clients Sort > Verify Clients Print > Verify Clients Filters > Verify Clients Pagination > Open Client Overview > Verify Client Overview > Verify Client Overview Close > Open Client Overview > Open Policy From Client Overview > Verify Policy Detail > Verify Policy Detail Close';

/** Investor: clients list is empty (no Tenant.Client API); policy detail via Policies tab. */
const INVESTOR_CLIENTS_FULL =
  'Login > Open Clients > Verify Clients Table > Verify Clients Search > Verify Clients Sort > Verify Clients Print > Verify Clients Filters > Verify Clients Pagination > Open Policy From Policies > Verify Policy Detail > Verify Policy Detail Close';

const POLICIES_FULL =
  'Login > Open Policies > Verify Policies Table > Verify Policies Search > Verify Policies Sort > Verify Policies Print > Verify Policies Filters > Verify Policies Pagination > Open Policy From Policies > Verify Policy Detail > Verify Policy Detail Sections > Verify Policy Detail Print > Verify Policy Detail Documents > Verify Policy Detail Close';

const APPLICATIONS_FULL =
  'Login > Open Applications > Verify Applications Table > Verify Applications Search > Verify Applications Sort > Verify Applications Print > Verify Applications Filters > Verify Applications Pagination > Open Application From List > Verify Application Detail > Verify Application Detail Status > Verify Application Detail Comments > Verify Application Detail Close';

const CREATE_APPLICATION_FULL =
  'Login > Open Create Application > Verify TMD Questions From API > Select Funeral Bond Type > Answer TMD From Excel > Confirm Create Application > Fill Application From Excel > Fill Step 2 From Excel > Fill Step 3 From Excel > Fill Step 4 From Excel > Accept Declarations > Review Summary > Verify Review From Excel > Upload Documents > Complete Signing > Submit Application > Verify Submission Reference > Verify Confirmation Email';

const CREATE_APPLICATION_TMD =
  'Login > Open Create Application > Verify TMD Questions From API > Verify TMD Wrong Answer Warning > Verify TMD Confirm Enabled Rules';

const CREATE_APPLICATION_VALIDATION =
  'Login > Open Create Application > Run Create Application Validation';

/** `dashboard-full` in Excel resolves by Persona column. */
export const DASHBOARD_FULL_BY_PERSONA: Partial<Record<Persona, string>> = {
  funeral: FUNERAL_DASHBOARD_FULL,
  adviser: ADVISER_DASHBOARD_FULL,
  investor: INVESTOR_DASHBOARD_FULL,
  admin: ADMIN_DASHBOARD_FULL,
};

/** `clients-full` in Excel resolves by Persona column. */
export const CLIENTS_FULL_BY_PERSONA: Partial<Record<Persona, string>> = {
  funeral: TENANT_CLIENTS_FULL,
  adviser: TENANT_CLIENTS_FULL,
  investor: INVESTOR_CLIENTS_FULL,
};

/** `policies-full` in Excel resolves by Persona column. */
export const POLICIES_FULL_BY_PERSONA: Partial<Record<Persona, string>> = {
  funeral: POLICIES_FULL,
  adviser: POLICIES_FULL,
  investor: POLICIES_FULL,
  admin: POLICIES_FULL,
};

/** `applications-full` in Excel resolves by Persona column. */
export const APPLICATIONS_FULL_BY_PERSONA: Partial<Record<Persona, string>> = {
  funeral: APPLICATIONS_FULL,
  adviser: APPLICATIONS_FULL,
  investor: APPLICATIONS_FULL,
  admin: APPLICATIONS_FULL,
};

export const NAMED_WORKFLOWS: Record<string, string> = {
  login: 'Login',

  dashboard: 'Login > Open Dashboard',

  // Funeral director (NFDA) dashboard — granular
  'dashboard-links': 'Login > Open Dashboard > Verify Dashboard Links',
  'client-age-check': 'Login > Open Dashboard > Verify Client Age Distribution',
  'recent-claim': 'Login > Open Dashboard > Open Recent Claim',
  'news-updates': 'Login > Open Dashboard > Verify News And Updates',
  'dashboard-videos': 'Login > Open Dashboard > Verify Dashboard Videos',

  // Financial adviser dashboard — granular
  'adviser-links': 'Login > Open Dashboard > Verify Adviser Dashboard Links',
  'adviser-widgets': 'Login > Open Dashboard > Verify Adviser Widgets',

  // Shared funeral + adviser widgets — granular
  'dashboard-exports': 'Login > Open Dashboard > Verify Dashboard Exports',
  'portfolio-check': 'Login > Open Dashboard > Verify Portfolio Summary',
  'recent-app': 'Login > Open Dashboard > Open Recent Application',
  'summary-filters': 'Login > Open Dashboard > Verify Summary Date Filters',

  // Investor / admin — granular
  'investor-links': 'Login > Open Dashboard > Verify Investor Dashboard Links',
  'investor-dashboard': 'Login > Open Dashboard > Verify Investor Dashboard',
  'admin-dashboard': 'Login > Open Dashboard > Verify Admin Dashboard',
  'admin-exports': 'Login > Open Dashboard > Verify Admin Dashboard Exports',

  // Clients tab — granular (funeral, adviser, investor)
  clients: 'Login > Open Clients',
  'clients-table': 'Login > Open Clients > Verify Clients Table',
  'clients-search': 'Login > Open Clients > Verify Clients Search',
  'clients-sort': 'Login > Open Clients > Verify Clients Sort',
  'clients-print': 'Login > Open Clients > Verify Clients Print',
  'clients-filters': 'Login > Open Clients > Verify Clients Filters',
  'clients-pagination': 'Login > Open Clients > Verify Clients Pagination',
  'client-overview': 'Login > Open Clients > Open Client Overview > Verify Client Overview',

  // Policies tab — granular
  policies: 'Login > Open Policies',
  'policies-table': 'Login > Open Policies > Verify Policies Table',
  'policies-search': 'Login > Open Policies > Verify Policies Search',
  'policies-sort': 'Login > Open Policies > Verify Policies Sort',
  'policies-print': 'Login > Open Policies > Verify Policies Print',
  'policies-filters': 'Login > Open Policies > Verify Policies Filters',
  'policies-pagination': 'Login > Open Policies > Verify Policies Pagination',
  'policy-detail': 'Login > Open Policies > Open Policy From Policies > Verify Policy Detail',

  // Applications tab — granular
  applications: 'Login > Open Applications',
  'applications-table': 'Login > Open Applications > Verify Applications Table',
  'applications-search': 'Login > Open Applications > Verify Applications Search',
  'applications-sort': 'Login > Open Applications > Verify Applications Sort',
  'applications-print': 'Login > Open Applications > Verify Applications Print',
  'applications-filters': 'Login > Open Applications > Verify Applications Filters',
  'applications-pagination': 'Login > Open Applications > Verify Applications Pagination',
  'application-detail': 'Login > Open Applications > Open Application From List > Verify Application Detail',

  // Persona-specific full suites (aliases — prefer `dashboard-full` + Persona in Excel)
  'funeral-full': FUNERAL_DASHBOARD_FULL,
  'dashboard-full': ADVISER_DASHBOARD_FULL,
  'investor-full': INVESTOR_DASHBOARD_FULL,
  'admin-full': ADMIN_DASHBOARD_FULL,
  'funeral-clients-full': TENANT_CLIENTS_FULL,
  'clients-full': TENANT_CLIENTS_FULL,
  'policies-full': POLICIES_FULL,
  'applications-full': APPLICATIONS_FULL,
  'create-application-full': CREATE_APPLICATION_FULL,
  'create-application-tmd': CREATE_APPLICATION_TMD,
  'create-application-validation': CREATE_APPLICATION_VALIDATION,
};

export function resolveApplicationsFullWorkflow(persona: Persona): string {
  const chain = APPLICATIONS_FULL_BY_PERSONA[persona];
  if (!chain) {
    throw new Error(
      `Workflow "applications-full" is not supported for persona "${persona}". ` +
        `Currently: funeral, adviser, investor, admin.`,
    );
  }
  return chain;
}

export function resolvePoliciesFullWorkflow(persona: Persona): string {
  const chain = POLICIES_FULL_BY_PERSONA[persona];
  if (!chain) {
    throw new Error(
      `Workflow "policies-full" is not supported for persona "${persona}". ` +
        `Currently: funeral, adviser, investor, admin.`,
    );
  }
  return chain;
}

export function resolveClientsFullWorkflow(persona: Persona): string {
  const chain = CLIENTS_FULL_BY_PERSONA[persona];
  if (!chain) {
    throw new Error(
      `Workflow "clients-full" is not supported for persona "${persona}". ` +
        `Currently: funeral, adviser, investor.`,
    );
  }
  return chain;
}

export function resolveDashboardFullWorkflow(persona: Persona): string {
  const chain = DASHBOARD_FULL_BY_PERSONA[persona];
  if (!chain) {
    throw new Error(
      `Workflow "dashboard-full" is not supported for persona "${persona}". ` +
        `Use: funeral, adviser, investor, or admin.`,
    );
  }
  return chain;
}
