import type { Persona } from '../../framework/data/matrix.types';

export type PolicyListItem = {
  portfoliocode?: string;
  portfolioname?: string;
  product?: string;
  type?: string;
  effectivedate?: string;
  policybalance?: string | number;
  status?: string | null;
  advisorName?: string;
};

export type PolicyDetailResponse = {
  portfoliocode?: string;
  product?: string;
  firstownerDto?: Array<{ givenname?: string; surname?: string }>;
};

export const POLICIES_SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser', 'investor', 'admin']);

export function usesStaffPolicyApi(persona: Persona): boolean {
  return persona === 'admin';
}

export function hasPolicyListFilters(persona: Persona): boolean {
  return persona !== 'investor';
}

export function policyListColumns(persona: Persona): readonly string[] {
  if (persona === 'investor') {
    return [
      'Policy Number',
      'Product',
      'Policy Type',
      'Policy Name',
      'Date Opened',
      'Current Balance',
      'Policy Status',
    ];
  }

  if (persona === 'admin') {
    return [
      'Policy Number',
      'Policy Name',
      'Product',
      'Policy Type',
      'Date Opened',
      'Current Balance',
      'Adviser',
      'Partner',
    ];
  }

  if (persona === 'adviser') {
    return [
      'Policy Name',
      'Product',
      'Policy Type',
      'Date Opened',
      'Current Balance',
      'Claim Status',
    ];
  }

  return [
    'Policy Number',
    'Policy Name',
    'Product',
    'Policy Type',
    'Date Opened',
    'Current Balance',
    'Claim Status',
  ];
}

export const SORTABLE_POLICY_COLUMNS = [
  'Policy Number',
  'Policy Name',
  'Product',
  'Policy Type',
  'Date Opened',
  'Current Balance',
  'Claim Status',
  'Policy Status',
  'Adviser',
] as const;
