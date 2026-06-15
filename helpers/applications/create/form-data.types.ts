import type { FuneralBondType } from './bond-types';

export type PaymentType = 'BPAY' | 'EFT' | 'DirectDebit';

export type CreateApplicationFormData = {
  dataRow: string;
  bondType: FuneralBondType;
  tmdAnswers: string;

  title: string;
  givenName: string;
  middleName: string;
  surname: string;
  email: string;
  dob: string;
  gender: 'female' | 'male' | 'other';
  phone: string;
  streetNumber: string;
  streetName: string;
  streetType: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  mailingSameAsResidential: string;
  addJointOwner: string;
  addPOA: string;
  addLifeInsured: string;

  initialAmount: string;
  rspAmount: string;
  rspFrequency: string;
  defaultCapital: string;

  allocationMode: string;
  fund1Code: string;
  fund1Percent: string;

  paymentType: PaymentType;
  bankName: string;
  bsb: string;
  accountName: string;
  accountNumber: string;

  documentSet: string;
};

export type CreateApplicationValidationRow = {
  scenarioId: string;
  bondType: string;
  step: number;
  testCase: string;
  field: string;
  inputValue: string;
  expectedError: string;
  persona: string;
};
