/**
 * Named workflow shortcuts for the Excel Workflow column.
 * Use the key (e.g. "dashboard-full") in Excel instead of typing the full step chain.
 * All names are matched case-insensitively.
 *
 * Personas that support each shortcut:
 *   login              → all
 *   dashboard          → all
 *   dashboard-full     → funeral, adviser (adviser dashboard widgets)
 *   funeral-full       → funeral only  (includes Verify Dashboard Links)
 *   dashboard-links    → funeral only
 *   dashboard-exports  → funeral, adviser
 *   portfolio-check    → funeral, adviser
 *   recent-app         → funeral, adviser
 *   summary-filters    → funeral, adviser (Claims Summary filters — funeral only)
 */
export const NAMED_WORKFLOWS: Record<string, string> = {
  login: 'Login',

  dashboard: 'Login > Open Dashboard',

  'dashboard-links': 'Login > Open Dashboard > Verify Dashboard Links',
  'dashboard-exports': 'Login > Open Dashboard > Verify Dashboard Exports',
  'portfolio-check': 'Login > Open Dashboard > Verify Portfolio Summary',
  'recent-app': 'Login > Open Dashboard > Open Recent Application',
  'summary-filters': 'Login > Open Dashboard > Verify Summary Date Filters',

  // All post-dashboard checks — safe for funeral, adviser, admin
  'dashboard-full':
    'Login > Open Dashboard > Verify Portfolio Summary > Verify Dashboard Exports > Verify Summary Date Filters > Open Recent Application',

  // Full funeral suite — adds the NFDA quick-links check (funeral only)
  'funeral-full':
    'Login > Open Dashboard > Verify Dashboard Links > Verify Portfolio Summary > Verify Dashboard Exports > Verify Summary Date Filters > Open Recent Application',
};
