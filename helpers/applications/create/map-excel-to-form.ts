import { normalizeFuneralBondType, type FuneralBondType } from './bond-types';
import { DEFAULT_CREATE_APPLICATION_EMAIL } from './default-email';
import type { CreateApplicationFormData, PaymentType } from './form-data.types';

function cell(raw: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = raw[key];
    if (direct !== undefined && direct !== '') return direct.trim();
    const found = Object.entries(raw).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (found && found[1] !== '') return found[1].trim();
  }
  return '';
}

function normalizePaymentType(value: string): PaymentType {
  const v = value.trim().toLowerCase().replace(/\s+/g, '');
  if (v === 'bpay' || v === 'b pay') return 'BPAY';
  if (v === 'eft') return 'EFT';
  if (v === 'directdebit' || v === 'dd' || v === 'direct debit') return 'DirectDebit';
  return 'BPAY';
}

function normalizeGender(value: string): CreateApplicationFormData['gender'] {
  const v = value.trim().toLowerCase();
  if (v === 'female' || v === 'f') return 'female';
  if (v === 'other' || v === 'o') return 'other';
  return 'male';
}

export function mapExcelRowToFormData(
  dataRow: string,
  raw: Record<string, string>,
  defaults?: Partial<CreateApplicationFormData>,
): CreateApplicationFormData {
  const bondRaw = cell(raw, 'bondType', 'BondType') || defaults?.bondType || 'PREPAID';
  const bondType: FuneralBondType = normalizeFuneralBondType(bondRaw);

  return {
    dataRow,
    bondType,
    tmdAnswers: cell(raw, 'tmdAnswers', 'TmdAnswers') || defaults?.tmdAnswers || 'yes,no,no,no',

    title: cell(raw, 'title', 'Title') || defaults?.title || 'Mr',
    givenName: cell(raw, 'givenName', 'GivenName') || defaults?.givenName || 'Playwright',
    middleName: cell(raw, 'middleName', 'MiddleName') || defaults?.middleName || '',
    surname: cell(raw, 'surname', 'Surname') || defaults?.surname || 'Investor',
    email: cell(raw, 'email', 'Email') || defaults?.email || DEFAULT_CREATE_APPLICATION_EMAIL,
    dob: cell(raw, 'dob', 'DOB', 'dateOfBirth') || defaults?.dob || '1980-01-15',
    gender: normalizeGender(cell(raw, 'gender', 'Gender') || defaults?.gender || 'male'),
    phone: cell(raw, 'phone', 'Phone', 'mobile') || defaults?.phone || '0412345678',
    streetNumber: cell(raw, 'streetNumber') || defaults?.streetNumber || '10',
    streetName: cell(raw, 'streetName') || defaults?.streetName || 'Main',
    streetType: cell(raw, 'streetType') || defaults?.streetType || 'Street',
    suburb: cell(raw, 'suburb') || defaults?.suburb || 'Sydney',
    state: cell(raw, 'state', 'State') || defaults?.state || 'New South Wales',
    postcode: cell(raw, 'postcode', 'Postcode') || defaults?.postcode || '2000',
    country: cell(raw, 'country', 'Country') || defaults?.country || 'Australia',
    mailingSameAsResidential:
      cell(raw, 'mailingSameAsResidential') || defaults?.mailingSameAsResidential || 'Y',
    addJointOwner: cell(raw, 'addJointOwner') || defaults?.addJointOwner || 'N',
    addPOA: cell(raw, 'addPOA') || defaults?.addPOA || 'N',
    addLifeInsured: cell(raw, 'addLifeInsured') || defaults?.addLifeInsured || 'N',

    initialAmount: cell(raw, 'initialAmount', 'InitialAmount') || defaults?.initialAmount || '1000',
    rspAmount: cell(raw, 'rspAmount') || defaults?.rspAmount || '',
    rspFrequency: cell(raw, 'rspFrequency') || defaults?.rspFrequency || '',
    defaultCapital: cell(raw, 'defaultCapital') || defaults?.defaultCapital || 'Y',

    allocationMode: cell(raw, 'allocationMode') || defaults?.allocationMode || 'percent',
    fund1Code: cell(raw, 'fund1Code') || defaults?.fund1Code || '',
    fund1Percent: cell(raw, 'fund1Percent') || defaults?.fund1Percent || '100',

    paymentType: normalizePaymentType(cell(raw, 'paymentType') || defaults?.paymentType || 'BPAY'),
    bankName: cell(raw, 'bankName') || defaults?.bankName || '',
    bsb: cell(raw, 'bsb', 'BSB') || defaults?.bsb || '',
    accountName: cell(raw, 'accountName') || defaults?.accountName || '',
    accountNumber: cell(raw, 'accountNumber') || defaults?.accountNumber || '',

    documentSet: cell(raw, 'documentSet', 'DocumentSet') || defaults?.documentSet || 'default-docs',
  };
}

export function dobToIso(dob: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
  const slash = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) {
    return `${slash[3]}-${slash[2]}-${slash[1]}`;
  }
  return dob;
}
