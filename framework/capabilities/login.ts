import type { Page } from '@playwright/test';
import type { B2CTenant } from '../../helpers/env';
import { loginViaB2C, attemptLoginViaB2C } from '../../helpers/auth/login-b2c';
import { loginAsGuest } from '../../helpers/auth/login-guest';
import {
  assertLoginSuccess,
  assertLoginFailed,
} from '../../helpers/auth/assert-logged-in';
import { DashboardPage } from '../../pages/dashboard.page';
import { resolveCredentials } from '../credentials/resolve-credentials';
import type { MatrixRow } from '../data/matrix.types';

function useSavedSession(row: MatrixRow): boolean {
  return (
    process.env.MATRIX_USE_SESSION === '1' &&
    row.persona !== 'guest' &&
    row.expectedResult !== 'validation_error'
  );
}

function b2cTenantForPersona(persona: MatrixRow['persona']): B2CTenant {
  return persona === 'investor' ? 'investor' : 'adviser';
}

export async function executeLoginCapability(page: Page, row: MatrixRow): Promise<void> {
  if (useSavedSession(row)) {
    const dashboard = new DashboardPage(page, row.persona);
    await dashboard.open();
    await dashboard.assertLoaded();
    return;
  }

  if (row.expectedResult === 'validation_error') {
    if (row.persona === 'guest') {
      throw new Error(`Row ${row.caseNo}: validation_error is not applicable for guest login`);
    }

    const creds = resolveCredentials(row);
    await attemptLoginViaB2C(
      page,
      b2cTenantForPersona(row.persona),
      creds.username!,
      creds.password!,
    );
    await assertLoginFailed(page, row.persona);
    return;
  }

  if (row.persona === 'guest') {
    await loginAsGuest(page);
    await assertLoginSuccess(page, row.persona);
    return;
  }

  const creds = resolveCredentials(row);
  await loginViaB2C(
    page,
    b2cTenantForPersona(row.persona),
    creds.username!,
    creds.password!,
  );
  await assertLoginSuccess(page, row.persona);
}
