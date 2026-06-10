import path from 'path';

export const AUTH_DIR = path.join(__dirname, '..', '.auth');

export type B2CTenant = 'investor' | 'adviser';

export const ROLES = {
  investor: ['Client'],
  funeralDirector: ['Tenant.Admin', 'Tenant.Director'],
  financialAdviser: ['Tenant.Advisoradmin', 'Tenant.Advisor'],
  admin: ['System.Admin', 'ki_staff'],
  guest: ['Guest'],
} as const;

export function getPortalUrl(): string {
  return process.env.PORTAL_URL ?? 'https://polite-plant-02b096d00.6.azurestaticapps.net';
}

export function getApiUrl(): string {
  return process.env.API_URL ?? 'https://test-kiep-api.azurewebsites.net';
}

/** True when env var is set to a real value (not empty or placeholder). */
export function hasCredentials(emailEnv: string, passwordEnv: string): boolean {
  const email = process.env[emailEnv]?.trim();
  const password = process.env[passwordEnv]?.trim();
  if (!email || !password) return false;
  if (email === '...' || password === '...') return false;
  return true;
}
