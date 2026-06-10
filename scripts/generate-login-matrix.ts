import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

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
];

/** Workflow + persona rows — caseNo is assigned sequentially as TC-01, TC-02, … */
const matrixRows: Array<[string, string, string, string, string]> = [
  // Login
  ['login', 'guest', '', '', 'success'],
  ['login', 'investor', '', '', 'success'],
  ['login', 'funeral', '', '', 'success'],
  ['login', 'adviser', '', '', 'success'],
  ['login', 'admin', '', '', 'success'],
  ['login', 'funeral', 'baduser', 'WrongPass123', 'validation_error'],

  // Dashboard open (guest has no dashboard)
  ['dashboard', 'investor', '', '', 'success'],
  ['dashboard', 'funeral', '', '', 'success'],
  ['dashboard', 'adviser', '', '', 'success'],
  ['dashboard', 'admin', '', '', 'success'],

  // Dashboard links — funeral only (NFDA quick links)
  ['dashboard-links', 'funeral', '', '', 'success'],

  // Shared adviser-dashboard widgets (funeral + adviser; admin uses Ki staff dashboard)
  ['dashboard-exports', 'funeral', '', '', 'success'],
  ['dashboard-exports', 'adviser', '', '', 'success'],

  ['portfolio-check', 'funeral', '', '', 'success'],
  ['portfolio-check', 'adviser', '', '', 'success'],

  ['recent-app', 'funeral', '', '', 'success'],
  ['recent-app', 'adviser', '', '', 'success'],

  ['summary-filters', 'funeral', '', '', 'success'],
  ['summary-filters', 'adviser', '', '', 'success'],

  ['dashboard-full', 'funeral', '', '', 'success'],
  ['dashboard-full', 'adviser', '', '', 'success'],

  ['funeral-full', 'funeral', '', '', 'success'],
];

const rows = matrixRows.map((row, index) => {
  const caseNo = `TC-${String(index + 1).padStart(2, '0')}`;
  return [caseNo, 'Y', ...row] as [string, string, string, string, string, string, string];
});

fs.mkdirSync(outDir, { recursive: true });

const sheetData = [headers, ...rows];
const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'TestMatrix');
XLSX.writeFile(workbook, outFile);

console.log(`Created ${outFile} with ${rows.length} rows (TC-01 … TC-${String(rows.length).padStart(2, '0')}).`);
