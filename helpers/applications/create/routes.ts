/**
 * Create Application flow — routes and APIs (from EIPFrontEnd + codegen spike).
 *
 * Entry:
 * - funeral/adviser: /adviser/application → Create New → New Application dialog
 * - investor: /investor/application → Create New → SelectBond dialog
 * - guest: /guest/select-bond → Accept T&C → Funeral Bond → SelectBond dialog
 *
 * TMD API: GET {API_URL}/ki/tmd-questions (Bearer from auth_session)
 * Create:   POST {API_URL}/application/create
 *
 * Wizard (funeral bond):
 *   investor-details → investment-amount → [investment-allocation] →
 *   payment-details → [adviser-fees] → accept-declaration → review-summary → upload-signed-copy
 *
 * Adviser persona adds adviser-fees between payment-details and accept-declaration.
 *
 * E-sign: upload via #file-input-signed; submit triggers POST /files/upload + PUT /application/update-status
 */
export const CREATE_APPLICATION_API = {
  tmdQuestions: '/ki/tmd-questions',
  create: '/application/create',
  investorDetails: '/owner/createInvestorDetailsAndClients',
  investOption: '/invest-option',
  payment: '/payment',
  fileUpload: '/files/upload',
  updateStatus: '/application/update-status',
} as const;

export const FUNERAL_BOND_WIZARD_STEPS = [
  'investor-details',
  'investment-amount',
  'investment-allocation',
  'payment-details',
  'adviser-fees',
  'accept-declaration',
  'review-summary',
  'upload-signed-copy',
] as const;

export type FuneralBondWizardStep = (typeof FUNERAL_BOND_WIZARD_STEPS)[number];

export function wizardUrlPattern(step: FuneralBondWizardStep): RegExp {
  return new RegExp(`/application/funeral-bond/${step}/[0-9a-f-]{36}`, 'i');
}
