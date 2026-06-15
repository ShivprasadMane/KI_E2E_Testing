import type { Page } from '@playwright/test';
import type { MatrixRow } from '../data/matrix.types';
import { executeLoginCapability } from './login';
import { executeOpenDashboardCapability } from './open-dashboard';
import { executeOpenClientsCapability } from './open-clients';
import { executeVerifyDashboardLinksCapability } from './verify-dashboard-links';
import { executeVerifyAdviserDashboardLinksCapability } from './verify-adviser-dashboard-links';
import { executeVerifyDashboardExportsCapability } from './verify-dashboard-exports';
import { executeVerifyPortfolioSummaryCapability } from './verify-portfolio-summary';
import { executeVerifyClientAgeDistributionCapability } from './verify-client-age-distribution';
import { executeOpenRecentApplicationCapability } from './open-recent-application';
import { executeOpenRecentClaimCapability } from './open-recent-claim';
import { executeVerifySummaryDateFiltersCapability } from './verify-summary-date-filters';
import { executeVerifyAdviserWidgetsCapability } from './verify-adviser-widgets';
import { executeVerifyDashboardVideosCapability } from './verify-dashboard-videos';
import { executeVerifyNewsUpdatesCapability } from './verify-news-updates';
import { executeVerifyInvestorDashboardCapability } from './verify-investor-dashboard';
import { executeVerifyInvestorDashboardLinksCapability } from './verify-investor-dashboard-links';
import { executeVerifyAdminDashboardCapability } from './verify-admin-dashboard';
import { executeVerifyAdminDashboardExportsCapability } from './verify-admin-dashboard-exports';
import { executeVerifyClientsTableCapability } from './verify-clients-table';
import { executeVerifyClientsSearchCapability } from './verify-clients-search';
import { executeVerifyClientsSortCapability } from './verify-clients-sort';
import { executeVerifyClientsPrintCapability } from './verify-clients-print';
import { executeVerifyClientsFiltersCapability } from './verify-clients-filters';
import { executeVerifyClientsPaginationCapability } from './verify-clients-pagination';
import { executeOpenClientOverviewCapability } from './open-client-overview';
import { executeVerifyClientOverviewCapability } from './verify-client-overview';
import { executeVerifyClientOverviewCloseCapability } from './verify-client-overview-close';
import { executeOpenPolicyFromClientOverviewCapability } from './open-policy-from-client-overview';
import { executeVerifyPolicyDetailCapability } from './verify-policy-detail';
import { executeVerifyPolicyDetailCloseCapability } from './verify-policy-detail-close';
import { executeOpenPolicyFromPoliciesCapability } from './open-policy-from-policies';
import { executeOpenPoliciesCapability } from './open-policies';
import { executeVerifyPoliciesTableCapability } from './verify-policies-table';
import { executeVerifyPoliciesSearchCapability } from './verify-policies-search';
import { executeVerifyPoliciesSortCapability } from './verify-policies-sort';
import { executeVerifyPoliciesPrintCapability } from './verify-policies-print';
import { executeVerifyPoliciesFiltersCapability } from './verify-policies-filters';
import { executeVerifyPoliciesPaginationCapability } from './verify-policies-pagination';
import { executeVerifyPolicyDetailSectionsCapability } from './verify-policy-detail-sections';
import { executeVerifyPolicyDetailPrintCapability } from './verify-policy-detail-print';
import { executeVerifyPolicyDetailDocumentsCapability } from './verify-policy-detail-documents';
import { executeOpenApplicationsCapability } from './open-applications';
import { executeVerifyApplicationsTableCapability } from './verify-applications-table';
import { executeVerifyApplicationsSearchCapability } from './verify-applications-search';
import { executeVerifyApplicationsSortCapability } from './verify-applications-sort';
import { executeVerifyApplicationsPrintCapability } from './verify-applications-print';
import { executeVerifyApplicationsFiltersCapability } from './verify-applications-filters';
import { executeVerifyApplicationsPaginationCapability } from './verify-applications-pagination';
import { executeOpenApplicationFromListCapability } from './open-application-from-list';
import { executeVerifyApplicationDetailCapability } from './verify-application-detail';
import { executeVerifyApplicationDetailStatusCapability } from './verify-application-detail-status';
import { executeVerifyApplicationDetailCommentsCapability } from './verify-application-detail-comments';
import { executeVerifyApplicationDetailCloseCapability } from './verify-application-detail-close';
import { executeOpenCreateApplicationCapability } from './open-create-application';
import { executeVerifyTmdQuestionsFromApiCapability } from './verify-tmd-questions-from-api';
import { executeSelectFuneralBondTypeCapability } from './select-funeral-bond-type';
import { executeAnswerTmdQuestionsCapability } from './answer-tmd-questions';
import { executeVerifyTmdWrongAnswerWarningCapability } from './verify-tmd-wrong-answer-warning';
import { executeVerifyTmdConfirmEnabledCapability } from './verify-tmd-confirm-enabled';
import { executeConfirmCreateApplicationCapability } from './confirm-create-application';
import { executeFillApplicationFromExcelCapability } from './fill-application-from-excel';
import { executeFillStep2FromExcelCapability } from './fill-step-2-from-excel';
import { executeFillStep3FromExcelCapability } from './fill-step-3-from-excel';
import { executeFillStep4FromExcelCapability } from './fill-step-4-from-excel';
import { executeAcceptDeclarationsCapability } from './accept-declarations';
import { executeReviewSummaryCapability } from './review-summary';
import { executeVerifyReviewFromExcelCapability } from './verify-review-from-excel';
import { executeUploadDocumentsCapability } from './upload-documents';
import { executeCompleteSigningCapability } from './complete-signing';
import { executeSubmitApplicationCapability } from './submit-application';
import { executeVerifySubmissionReferenceCapability } from './verify-submission-reference';
import { executeVerifyConfirmationEmailCapability } from './verify-confirmation-email';
import { executeRunCreateApplicationValidationCapability } from './run-create-application-validation';

export type CapabilityHandler = (page: Page, row: MatrixRow) => Promise<void>;

const REGISTRY: Record<string, CapabilityHandler> = {
  login: executeLoginCapability,
  'open dashboard': executeOpenDashboardCapability,
  'open clients': executeOpenClientsCapability,
  'verify dashboard links': executeVerifyDashboardLinksCapability,
  'verify adviser dashboard links': executeVerifyAdviserDashboardLinksCapability,
  'verify dashboard exports': executeVerifyDashboardExportsCapability,
  'verify portfolio summary': executeVerifyPortfolioSummaryCapability,
  'verify client age distribution': executeVerifyClientAgeDistributionCapability,
  'open recent application': executeOpenRecentApplicationCapability,
  'open recent claim': executeOpenRecentClaimCapability,
  'verify summary date filters': executeVerifySummaryDateFiltersCapability,
  'verify adviser widgets': executeVerifyAdviserWidgetsCapability,
  'verify dashboard videos': executeVerifyDashboardVideosCapability,
  'verify news and updates': executeVerifyNewsUpdatesCapability,
  'verify investor dashboard': executeVerifyInvestorDashboardCapability,
  'verify investor dashboard links': executeVerifyInvestorDashboardLinksCapability,
  'verify admin dashboard': executeVerifyAdminDashboardCapability,
  'verify admin dashboard exports': executeVerifyAdminDashboardExportsCapability,
  'verify clients table': executeVerifyClientsTableCapability,
  'verify clients search': executeVerifyClientsSearchCapability,
  'verify clients sort': executeVerifyClientsSortCapability,
  'verify clients print': executeVerifyClientsPrintCapability,
  'verify clients filters': executeVerifyClientsFiltersCapability,
  'verify clients pagination': executeVerifyClientsPaginationCapability,
  'open client overview': executeOpenClientOverviewCapability,
  'verify client overview': executeVerifyClientOverviewCapability,
  'verify client overview close': executeVerifyClientOverviewCloseCapability,
  'open policy from client overview': executeOpenPolicyFromClientOverviewCapability,
  'verify policy detail': executeVerifyPolicyDetailCapability,
  'verify policy detail close': executeVerifyPolicyDetailCloseCapability,
  'open policy from policies': executeOpenPolicyFromPoliciesCapability,
  'open policies': executeOpenPoliciesCapability,
  'verify policies table': executeVerifyPoliciesTableCapability,
  'verify policies search': executeVerifyPoliciesSearchCapability,
  'verify policies sort': executeVerifyPoliciesSortCapability,
  'verify policies print': executeVerifyPoliciesPrintCapability,
  'verify policies filters': executeVerifyPoliciesFiltersCapability,
  'verify policies pagination': executeVerifyPoliciesPaginationCapability,
  'verify policy detail sections': executeVerifyPolicyDetailSectionsCapability,
  'verify policy detail print': executeVerifyPolicyDetailPrintCapability,
  'verify policy detail documents': executeVerifyPolicyDetailDocumentsCapability,
  'open applications': executeOpenApplicationsCapability,
  'verify applications table': executeVerifyApplicationsTableCapability,
  'verify applications search': executeVerifyApplicationsSearchCapability,
  'verify applications sort': executeVerifyApplicationsSortCapability,
  'verify applications print': executeVerifyApplicationsPrintCapability,
  'verify applications filters': executeVerifyApplicationsFiltersCapability,
  'verify applications pagination': executeVerifyApplicationsPaginationCapability,
  'open application from list': executeOpenApplicationFromListCapability,
  'verify application detail': executeVerifyApplicationDetailCapability,
  'verify application detail status': executeVerifyApplicationDetailStatusCapability,
  'verify application detail comments': executeVerifyApplicationDetailCommentsCapability,
  'verify application detail close': executeVerifyApplicationDetailCloseCapability,
  'open create application': executeOpenCreateApplicationCapability,
  'verify tmd questions from api': executeVerifyTmdQuestionsFromApiCapability,
  'select funeral bond type': executeSelectFuneralBondTypeCapability,
  'answer tmd from excel': executeAnswerTmdQuestionsCapability,
  'answer tmd questions': executeAnswerTmdQuestionsCapability,
  'verify tmd wrong answer warning': executeVerifyTmdWrongAnswerWarningCapability,
  'verify tmd confirm enabled rules': executeVerifyTmdConfirmEnabledCapability,
  'verify tmd confirm enabled': executeVerifyTmdConfirmEnabledCapability,
  'confirm create application': executeConfirmCreateApplicationCapability,
  'fill application from excel': executeFillApplicationFromExcelCapability,
  'fill step 2 from excel': executeFillStep2FromExcelCapability,
  'fill step 3 from excel': executeFillStep3FromExcelCapability,
  'fill step 4 from excel': executeFillStep4FromExcelCapability,
  'accept declarations': executeAcceptDeclarationsCapability,
  'review summary': executeReviewSummaryCapability,
  'verify review from excel': executeVerifyReviewFromExcelCapability,
  'upload documents': executeUploadDocumentsCapability,
  'complete signing': executeCompleteSigningCapability,
  'submit application': executeSubmitApplicationCapability,
  'verify submission reference': executeVerifySubmissionReferenceCapability,
  'verify confirmation email': executeVerifyConfirmationEmailCapability,
  'run create application validation': executeRunCreateApplicationValidationCapability,
};

/** Tester-friendly aliases → canonical capability keys. */
const ALIASES: Record<string, string> = {
  login: 'login',
  dashboard: 'open dashboard',
  'open dashboard': 'open dashboard',
  clients: 'open clients',
  'open clients': 'open clients',
  'dashboard links': 'verify dashboard links',
  'verify dashboard links': 'verify dashboard links',
  'verify funeral dashboard links': 'verify dashboard links',
  'adviser links': 'verify adviser dashboard links',
  'verify adviser dashboard links': 'verify adviser dashboard links',
  'verify adviser links': 'verify adviser dashboard links',
  'dashboard exports': 'verify dashboard exports',
  'verify dashboard exports': 'verify dashboard exports',
  'export dashboard reports': 'verify dashboard exports',
  'portfolio summary': 'verify portfolio summary',
  'verify portfolio summary': 'verify portfolio summary',
  'portfolio check': 'verify portfolio summary',
  'client age': 'verify client age distribution',
  'verify client age distribution': 'verify client age distribution',
  'client age check': 'verify client age distribution',
  'recent application': 'open recent application',
  'open recent application': 'open recent application',
  'view recent application': 'open recent application',
  'recent claim': 'open recent claim',
  'open recent claim': 'open recent claim',
  'summary date filters': 'verify summary date filters',
  'verify summary date filters': 'verify summary date filters',
  'verify applications summary date filter': 'verify summary date filters',
  'verify claims summary date filter': 'verify summary date filters',
  'adviser widgets': 'verify adviser widgets',
  'verify adviser widgets': 'verify adviser widgets',
  'dashboard videos': 'verify dashboard videos',
  'verify dashboard videos': 'verify dashboard videos',
  'news updates': 'verify news and updates',
  'verify news and updates': 'verify news and updates',
  'verify news updates': 'verify news and updates',
  'investor links': 'verify investor dashboard links',
  'verify investor dashboard links': 'verify investor dashboard links',
  'investor dashboard': 'verify investor dashboard',
  'verify investor dashboard': 'verify investor dashboard',
  'admin dashboard': 'verify admin dashboard',
  'verify admin dashboard': 'verify admin dashboard',
  'admin dashboard exports': 'verify admin dashboard exports',
  'verify admin dashboard exports': 'verify admin dashboard exports',
  'clients table': 'verify clients table',
  'verify clients table': 'verify clients table',
  'clients search': 'verify clients search',
  'verify clients search': 'verify clients search',
  'clients sort': 'verify clients sort',
  'verify clients sort': 'verify clients sort',
  'clients print': 'verify clients print',
  'verify clients print': 'verify clients print',
  'clients filters': 'verify clients filters',
  'verify clients filters': 'verify clients filters',
  'clients pagination': 'verify clients pagination',
  'verify clients pagination': 'verify clients pagination',
  'client overview': 'verify client overview',
  'open client overview': 'open client overview',
  'verify client overview': 'verify client overview',
  'verify client overview close': 'verify client overview close',
  'open policy from client overview': 'open policy from client overview',
  'verify policy detail': 'verify policy detail',
  'verify policy detail close': 'verify policy detail close',
  'open policy from policies': 'open policy from policies',
  policies: 'open policies',
  'open policies': 'open policies',
  'policies table': 'verify policies table',
  'verify policies table': 'verify policies table',
  'policies search': 'verify policies search',
  'verify policies search': 'verify policies search',
  'policies sort': 'verify policies sort',
  'verify policies sort': 'verify policies sort',
  'policies print': 'verify policies print',
  'verify policies print': 'verify policies print',
  'policies filters': 'verify policies filters',
  'verify policies filters': 'verify policies filters',
  'policies pagination': 'verify policies pagination',
  'verify policies pagination': 'verify policies pagination',
  'policy detail sections': 'verify policy detail sections',
  'verify policy detail sections': 'verify policy detail sections',
  'policy detail print': 'verify policy detail print',
  'verify policy detail print': 'verify policy detail print',
  'policy detail documents': 'verify policy detail documents',
  'verify policy detail documents': 'verify policy detail documents',
  applications: 'open applications',
  'open applications': 'open applications',
  'applications table': 'verify applications table',
  'verify applications table': 'verify applications table',
  'applications search': 'verify applications search',
  'verify applications search': 'verify applications search',
  'applications sort': 'verify applications sort',
  'verify applications sort': 'verify applications sort',
  'applications print': 'verify applications print',
  'verify applications print': 'verify applications print',
  'applications filters': 'verify applications filters',
  'verify applications filters': 'verify applications filters',
  'applications pagination': 'verify applications pagination',
  'verify applications pagination': 'verify applications pagination',
  'open application from list': 'open application from list',
  'verify application detail': 'verify application detail',
  'verify application detail status': 'verify application detail status',
  'verify application detail comments': 'verify application detail comments',
  'verify application detail close': 'verify application detail close',
  'open create application': 'open create application',
  'verify tmd questions from api': 'verify tmd questions from api',
  'select funeral bond type': 'select funeral bond type',
  'answer tmd from excel': 'answer tmd from excel',
  'answer tmd questions': 'answer tmd questions',
  'verify tmd wrong answer warning': 'verify tmd wrong answer warning',
  'verify tmd confirm enabled rules': 'verify tmd confirm enabled rules',
  'verify tmd confirm enabled': 'verify tmd confirm enabled',
  'confirm create application': 'confirm create application',
  'fill application from excel': 'fill application from excel',
  'fill step 2 from excel': 'fill step 2 from excel',
  'fill step 3 from excel': 'fill step 3 from excel',
  'fill step 4 from excel': 'fill step 4 from excel',
  'accept declarations': 'accept declarations',
  'review summary': 'review summary',
  'verify review from excel': 'verify review from excel',
  'upload documents': 'upload documents',
  'complete signing': 'complete signing',
  'submit application': 'submit application',
  'verify submission reference': 'verify submission reference',
  'verify confirmation email': 'verify confirmation email',
  'run create application validation': 'run create application validation',
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
    'Open Clients (funeral, adviser, investor)',
    'Verify Dashboard Links (funeral)',
    'Verify Adviser Dashboard Links (adviser)',
    'Verify Dashboard Exports (funeral, adviser)',
    'Verify Portfolio Summary (funeral, adviser)',
    'Verify Client Age Distribution (funeral, adviser)',
    'Open Recent Application (funeral, adviser)',
    'Open Recent Claim (funeral, adviser)',
    'Verify Summary Date Filters (funeral, adviser)',
    'Verify Adviser Widgets (adviser)',
    'Verify Dashboard Videos (funeral, adviser)',
    'Verify News And Updates (funeral, adviser, investor)',
    'Verify Investor Dashboard Links (investor)',
    'Verify Investor Dashboard (investor)',
    'Verify Admin Dashboard (admin)',
    'Verify Admin Dashboard Exports (admin)',
    'Verify Clients Table (funeral, adviser, investor)',
    'Verify Clients Search (funeral, adviser, investor)',
    'Verify Clients Sort (funeral, adviser, investor)',
    'Verify Clients Print (funeral, adviser, investor)',
    'Verify Clients Filters (funeral, adviser, investor)',
    'Verify Clients Pagination (funeral, adviser, investor)',
    'Open Client Overview (funeral, adviser)',
    'Verify Client Overview (funeral, adviser)',
    'Verify Client Overview Close (funeral, adviser)',
    'Open Policy From Client Overview (funeral, adviser)',
    'Open Policies (funeral, adviser, investor, admin)',
    'Verify Policies Table (funeral, adviser, investor, admin)',
    'Verify Policies Search (funeral, adviser, investor, admin)',
    'Verify Policies Sort (funeral, adviser, investor, admin)',
    'Verify Policies Print (funeral, adviser, investor, admin)',
    'Verify Policies Filters (funeral, adviser, admin; investor has none)',
    'Verify Policies Pagination (funeral, adviser, investor, admin)',
    'Open Policy From Policies (funeral, adviser, investor, admin)',
    'Verify Policy Detail (funeral, adviser, investor, admin)',
    'Verify Policy Detail Sections (funeral, adviser, investor, admin)',
    'Verify Policy Detail Print (funeral, adviser, investor, admin)',
    'Verify Policy Detail Documents (funeral, adviser, investor, admin)',
    'Verify Policy Detail Close (funeral, adviser, investor, admin)',
    'Open Applications (funeral, adviser, investor, admin)',
    'Verify Applications Table (funeral, adviser, investor, admin)',
    'Verify Applications Search (funeral, adviser, investor, admin)',
    'Verify Applications Sort (funeral, adviser, investor, admin)',
    'Verify Applications Print (funeral, adviser, investor, admin)',
    'Verify Applications Filters (funeral, adviser, admin; investor has none)',
    'Verify Applications Pagination (funeral, adviser, investor, admin)',
    'Open Application From List (funeral, adviser, investor, admin)',
    'Verify Application Detail (funeral, adviser, investor, admin)',
    'Verify Application Detail Status (funeral, adviser, investor, admin)',
    'Verify Application Detail Comments (funeral, adviser, admin; investor read-only)',
    'Verify Application Detail Close (funeral, adviser, investor, admin)',
    'Open Create Application (funeral, adviser, investor, guest)',
    'Verify TMD Questions From API',
    'Select Funeral Bond Type (funeral, adviser)',
    'Answer TMD From Excel',
    'Verify TMD Wrong Answer Warning',
    'Verify TMD Confirm Enabled Rules',
    'Confirm Create Application',
    'Fill Application From Excel (investor details step 1)',
    'Fill Step 2 From Excel (investment amounts + allocation)',
    'Fill Step 3 From Excel (allocation skip if default capital)',
    'Fill Step 4 From Excel (payment details)',
    'Accept Declarations',
    'Review Summary',
    'Verify Review From Excel',
    'Upload Documents',
    'Complete Signing',
    'Submit Application',
    'Verify Submission Reference',
    'Verify Confirmation Email',
    'Run Create Application Validation (scenario column)',
  ];
}
