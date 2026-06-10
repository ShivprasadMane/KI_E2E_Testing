import type { MatrixRow, Persona } from '../data/matrix.types';

export type ResolvedCredentials = {
  username?: string;
  password?: string;
  source: 'excel' | 'env' | 'none';
};

const PERSONA_ENV_MAP: Record<Exclude<Persona, 'guest'>, { email: string; password: string }> = {
  investor: { email: 'INVESTOR_EMAIL', password: 'INVESTOR_PASSWORD' },
  funeral: { email: 'FUNERAL_DIRECTOR_EMAIL', password: 'FUNERAL_DIRECTOR_PASSWORD' },
  adviser: { email: 'FINANCIAL_ADVISER_EMAIL', password: 'FINANCIAL_ADVISER_PASSWORD' },
  admin: { email: 'ADMIN_EMAIL', password: 'ADMIN_PASSWORD' },
};

function isRealValue(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  return v !== '' && v !== '...';
}

export function resolveCredentials(row: MatrixRow): ResolvedCredentials {
  if (row.persona === 'guest') {
    return { source: 'none' };
  }

  if (isRealValue(row.username) && isRealValue(row.password)) {
    return {
      username: row.username.trim(),
      password: row.password.trim(),
      source: 'excel',
    };
  }

  const envKeys = PERSONA_ENV_MAP[row.persona];
  const username = process.env[envKeys.email]?.trim();
  const password = process.env[envKeys.password]?.trim();

  if (!isRealValue(username) || !isRealValue(password)) {
    throw new Error(
      `Row ${row.caseNo}: No credentials in Excel and missing .env vars ` +
        `${envKeys.email} / ${envKeys.password} for persona "${row.persona}"`,
    );
  }

  return { username, password, source: 'env' };
}
