import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import {
  CREATE_APPLICATION_DATA_SHEET,
  CREATE_APPLICATION_VALIDATION_SHEET,
} from '../framework/data/create-application-matrix';
import { DEFAULT_CREATE_APPLICATION_EMAIL } from '../helpers/applications/create/default-email';

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'projects/keyinvest/data');
const outFile = path.join(outDir, 'matrix.xlsx');

const headers = [
  'caseNo',
  'Enabled',
  'Workflow',
  'Persona',
  'username',
  'password',
  'expectedResult',
  'bondType',
  'dataRow',
  'scenario',
  'documentSet',
];

type MatrixSeed = {
  workflow: string;
  persona: string;
  username?: string;
  password?: string;
  expectedResult?: string;
  bondType?: string;
  dataRow?: string;
  scenario?: string;
  documentSet?: string;
  enabled?: string;
};

const matrixSeeds: MatrixSeed[] = [
  { workflow: 'login', persona: 'guest' },
  { workflow: 'login', persona: 'investor' },
  { workflow: 'login', persona: 'funeral' },
  { workflow: 'login', persona: 'adviser' },
  { workflow: 'login', persona: 'admin' },
  { workflow: 'login', persona: 'funeral', username: 'baduser', password: 'WrongPass123', expectedResult: 'validation_error' },
  { workflow: 'login', persona: 'adviser', username: 'baduser', password: 'WrongPass123', expectedResult: 'validation_error' },
  { workflow: 'dashboard-full', persona: 'investor' },
  { workflow: 'dashboard-full', persona: 'funeral' },
  { workflow: 'dashboard-full', persona: 'adviser' },
  { workflow: 'dashboard-full', persona: 'admin' },
  { workflow: 'clients-full', persona: 'funeral' },
  { workflow: 'clients-full', persona: 'adviser' },
  { workflow: 'clients-full', persona: 'investor' },
  { workflow: 'policies-full', persona: 'funeral' },
  { workflow: 'policies-full', persona: 'adviser' },
  { workflow: 'policies-full', persona: 'investor' },
  { workflow: 'policies-full', persona: 'admin' },
  { workflow: 'applications-full', persona: 'funeral' },
  { workflow: 'applications-full', persona: 'adviser' },
  { workflow: 'applications-full', persona: 'investor' },
  { workflow: 'applications-full', persona: 'admin' },
  {
    workflow: 'create-application-full',
    persona: 'funeral',
    bondType: 'PREPAID',
    dataRow: 'PREPAID-FUNERAL-01',
    documentSet: 'default-docs',
    enabled: 'N',
  },
  {
    workflow: 'create-application-full',
    persona: 'funeral',
    bondType: 'NOMINATED',
    dataRow: 'NOMINATED-FUNERAL-01',
    documentSet: 'default-docs',
    enabled: 'N',
  },
  {
    workflow: 'create-application-full',
    persona: 'adviser',
    bondType: 'PREPAID',
    dataRow: 'PREPAID-ADVISER-01',
    documentSet: 'default-docs',
    enabled: 'N',
  },
  {
    workflow: 'create-application-full',
    persona: 'investor',
    bondType: 'NOMINATED',
    dataRow: 'NOMINATED-INVESTOR-01',
    documentSet: 'default-docs',
    enabled: 'N',
  },
  {
    workflow: 'create-application-full',
    persona: 'guest',
    bondType: 'PREPAID',
    dataRow: 'PREPAID-GUEST-01',
    documentSet: 'default-docs',
    enabled: 'N',
  },
  {
    workflow: 'create-application-tmd',
    persona: 'funeral',
    scenario: 'tmd-suite',
    enabled: 'N',
  },
  {
    workflow: 'create-application-tmd',
    persona: 'adviser',
    scenario: 'tmd-suite',
    enabled: 'N',
  },
  {
    workflow: 'create-application-validation',
    persona: 'funeral',
    scenario: 'tmd-wrong-q1',
    expectedResult: 'validation_error',
    enabled: 'N',
  },
];

const matrixRows = matrixSeeds.map((seed, index) => {
  const caseNo = `TC-${String(index + 1).padStart(2, '0')}`;
  return [
    caseNo,
    seed.enabled ?? 'Y',
    seed.workflow,
    seed.persona,
    seed.username ?? '',
    seed.password ?? '',
    seed.expectedResult ?? 'success',
    seed.bondType ?? '',
    seed.dataRow ?? '',
    seed.scenario ?? '',
    seed.documentSet ?? '',
  ];
});

const createApplicationDataHeaders = [
  'dataRow',
  'bondType',
  'tmdAnswers',
  'title',
  'givenName',
  'surname',
  'email',
  'dob',
  'gender',
  'phone',
  'streetNumber',
  'streetName',
  'streetType',
  'suburb',
  'state',
  'postcode',
  'country',
  'initialAmount',
  'defaultCapital',
  'paymentType',
  'documentSet',
];

const createApplicationDataRows = [
  [
    'PREPAID-FUNERAL-01',
    'PREPAID',
    'yes,no,no,no',
    'Mr',
    'Playwright',
    'FuneralPrepaid',
    DEFAULT_CREATE_APPLICATION_EMAIL,
    '1980-01-15',
    'male',
    '0412345678',
    '10',
    'Main',
    'Street',
    'Sydney',
    'New South Wales',
    '2000',
    'Australia',
    '1000',
    'Y',
    'BPAY',
    'default-docs',
  ],
  [
    'NOMINATED-FUNERAL-01',
    'NOMINATED',
    'yes,no,no,no',
    'Ms',
    'Playwright',
    'FuneralNominated',
    DEFAULT_CREATE_APPLICATION_EMAIL,
    '1975-06-20',
    'female',
    '0412345679',
    '20',
    'George',
    'Street',
    'Melbourne',
    'Victoria',
    '3000',
    'Australia',
    '1500',
    'N',
    'BPAY',
    'default-docs',
  ],
  [
    'PREPAID-ADVISER-01',
    'PREPAID',
    'yes,no,no,no',
    'Mr',
    'Playwright',
    'AdviserPrepaid',
    DEFAULT_CREATE_APPLICATION_EMAIL,
    '1982-03-10',
    'male',
    '0412345680',
    '5',
    'Collins',
    'Street',
    'Melbourne',
    'Victoria',
    '3000',
    'Australia',
    '1000',
    'Y',
    'BPAY',
    'default-docs',
  ],
  [
    'NOMINATED-INVESTOR-01',
    'NOMINATED',
    'yes,no,no,no',
    'Mr',
    'Playwright',
    'InvestorNominated',
    DEFAULT_CREATE_APPLICATION_EMAIL,
    '1978-11-05',
    'male',
    '0412345681',
    '8',
    'Queen',
    'Street',
    'Brisbane',
    'Queensland',
    '4000',
    'Australia',
    '1200',
    'Y',
    'BPAY',
    'default-docs',
  ],
  [
    'PREPAID-GUEST-01',
    'PREPAID',
    'yes,no,no,no',
    'Mr',
    'Playwright',
    'GuestPrepaid',
    DEFAULT_CREATE_APPLICATION_EMAIL,
    '1990-07-22',
    'male',
    '0412345682',
    '12',
    'King',
    'Street',
    'Perth',
    'Western Australia',
    '6000',
    'Australia',
    '1000',
    'Y',
    'BPAY',
    'default-docs',
  ],
];

const validationHeaders = [
  'scenarioId',
  'bondType',
  'step',
  'testCase',
  'field',
  'inputValue',
  'expectedError',
  'persona',
];

const validationRows = [
  ['tmd-wrong-q1', 'PREPAID', '0', 'TMD wrong answer', 'tmdQ1', 'no', 'Warning visible, Confirm disabled', 'funeral'],
  ['tmd-no-bond', 'PREPAID', '0', 'TMD no bond', 'bondType', '', 'Confirm disabled', 'funeral'],
  ['tmd-api-match', 'NOMINATED', '0', 'TMD API load', '', '', 'all API questions visible', 'funeral'],
  ['tmd-suite', 'PREPAID', '0', 'TMD API load', '', '', 'all API questions visible', 'funeral'],
  ['step1-invalid-email', 'PREPAID', '1', 'Email format', 'email', 'not-an-email', 'invalid email', 'funeral'],
];

fs.mkdirSync(outDir, { recursive: true });

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers, ...matrixRows]), 'TestMatrix');
XLSX.utils.book_append_sheet(
  workbook,
  XLSX.utils.aoa_to_sheet([createApplicationDataHeaders, ...createApplicationDataRows]),
  CREATE_APPLICATION_DATA_SHEET,
);
XLSX.utils.book_append_sheet(
  workbook,
  XLSX.utils.aoa_to_sheet([validationHeaders, ...validationRows]),
  CREATE_APPLICATION_VALIDATION_SHEET,
);
XLSX.writeFile(workbook, outFile);

console.log(`Created ${outFile}`);
console.log(`  TestMatrix: ${matrixRows.length} rows (TC-01 … TC-${String(matrixRows.length).padStart(2, '0')})`);
console.log(`  ${CREATE_APPLICATION_DATA_SHEET}: ${createApplicationDataRows.length} sample data rows`);
console.log(`  ${CREATE_APPLICATION_VALIDATION_SHEET}: ${validationRows.length} validation rows`);
console.log('');
console.log('  Create-application matrix rows (TC-23+) are Enabled=N by default — set Enabled=Y to run full wizard flows.');
