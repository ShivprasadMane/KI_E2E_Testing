import type { Persona } from '../../framework/data/matrix.types';

export type ApplicationListItem = {
  id?: string | number;
  displayId?: string;
  owner?: string;
  beneficiary?: string;
  user?: string;
  status?: string;
  submittedDate?: string;
  creationDate?: string;
  date?: string;
  settledDate?: string;
  initialContributionAmt?: string | number;
  value?: string | number;
  portfolio?: { type?: string };
  type?: string;
  tenantName?: string;
};

export type ApplicationDetailResponse = {
  id?: string | number;
  displayId?: string;
  status?: string;
  owners?: Array<{ givenname?: string; surname?: string; ownerType?: string }>;
};

export type ApplicationStatusHistoryItem = {
  from?: string;
  to?: string;
  updatedDate?: string;
  user?: string;
  reason?: string;
};

export type ApplicationComment = {
  comment?: string;
  createdDate?: string;
  createdBy?: string;
};

export const APPLICATIONS_SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser', 'investor', 'admin']);

export function usesStaffApplicationApi(persona: Persona): boolean {
  return persona === 'admin';
}

export function hasApplicationListFilters(persona: Persona): boolean {
  return persona !== 'investor';
}

export function canAddApplicationComments(persona: Persona): boolean {
  return persona !== 'investor';
}

export function applicationListColumns(persona: Persona): readonly string[] {
  if (persona === 'admin') {
    return [
      'Id',
      'Application Date',
      'Applicant Name',
      'Beneficiary',
      'Submitted By',
      'Partner',
      'KI staff',
      'Re-Assigned To',
      'Failure Reason',
      'Status',
      'Date Settled',
      'Value',
      'Bond Type',
    ];
  }

  if (persona === 'investor') {
    return [
      'Application ID',
      'Application Date',
      'Applicant Name',
      'Beneficiary',
      'Created By',
      'Status',
      'Date Settled',
      'Value',
      'Bond Type',
    ];
  }

  // Funeral + financial adviser tenant UI (no Id / Application Date columns in table)
  return [
    'Applicant Name',
    'Beneficiary',
    'Created By',
    'Status',
    'Date Settled',
    'Value',
    'Bond Type',
  ];
}

export const SORTABLE_APPLICATION_COLUMNS = [
  'Application ID',
  'Id',
  'Application Date',
  'Applicant Name',
  'Beneficiary',
  'Created By',
  'Submitted By',
  'Partner',
  'KI staff',
  'Re-Assigned To',
  'Failure Reason',
  'Status',
  'Date Settled',
  'Value',
  'Bond Type',
] as const;
