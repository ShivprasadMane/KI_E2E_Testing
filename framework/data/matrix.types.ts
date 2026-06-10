export const TEST_MATRIX_SHEET_NAME = 'TestMatrix';

export type Persona = 'guest' | 'investor' | 'funeral' | 'adviser' | 'admin';

export type ExpectedResult = 'success' | 'validation_error';

export type MatrixRow = {
  caseNo: string;
  enabled: boolean;
  workflow: string;
  persona: Persona;
  username: string;
  password: string;
  expectedResult: ExpectedResult;
  raw: Record<string, string>;
};

const ENABLED_VALUES = new Set(['y', 'yes', 'true', '1']);

export function isEnabledValue(value: string): boolean {
  return ENABLED_VALUES.has(value.trim().toLowerCase());
}

export function hasEnabledColumn(headers: string[]): boolean {
  return headers.some((h) => ['enabled', 'run'].includes(h.toLowerCase()));
}

export function hasWorkflowColumn(headers: string[]): boolean {
  return headers.some((h) => h.toLowerCase() === 'workflow');
}

export function normalizeExpected(value: string): ExpectedResult {
  const v = value.trim().toLowerCase();
  if (v === 'validation_error' || v === 'error' || v === 'fail') {
    return 'validation_error';
  }
  return 'success';
}

export function normalizePersona(value: string): Persona {
  const v = value.trim().toLowerCase();
  const map: Record<string, Persona> = {
    guest: 'guest',
    investor: 'investor',
    funeral: 'funeral',
    'funeral director': 'funeral',
    funeraldirector: 'funeral',
    adviser: 'adviser',
    advisor: 'adviser',
    'financial adviser': 'adviser',
    'financial advisor': 'adviser',
    admin: 'admin',
  };
  const persona = map[v];
  if (!persona) {
    throw new Error(`Unknown Persona "${value}". Use: guest, investor, funeral, adviser, admin`);
  }
  return persona;
}

export function getMatrixRowLabel(row: MatrixRow): string {
  const workflow = row.workflow.trim() || 'Login';
  return `[${row.caseNo}] ${row.persona}: ${workflow}`;
}
