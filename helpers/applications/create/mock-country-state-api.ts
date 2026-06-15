import type { Page } from '@playwright/test';
import { COUNTRY_STATE_FIXTURES } from './country-state-fixtures';

const mockedPages = new WeakSet<Page>();
const bootstrappedPages = new WeakSet<Page>();

function countryStoragePayload(): string {
  return JSON.stringify({
    state: {
      country: null,
      states: [],
      countries: COUNTRY_STATE_FIXTURES.countries,
    },
    version: 0,
  });
}

/**
 * Portal loads countries/states from api.countrystatecity.in (external, flaky in CI/VPN).
 * Stub deterministic fixtures so investor address fields always populate.
 */
export async function ensureCountryStateApiMock(page: Page): Promise<void> {
  if (mockedPages.has(page)) return;
  mockedPages.add(page);

  await page.route('**/countrystatecity.in/v1/countries/*/states', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    const countryCode = route.request().url().match(/\/countries\/([^/]+)\/states/)?.[1]?.toUpperCase();
    const states = COUNTRY_STATE_FIXTURES[countryCode ?? ''] ?? COUNTRY_STATE_FIXTURES.AU;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(states),
    });
  });

  await page.route('**/countrystatecity.in/v1/countries', async (route) => {
    if (route.request().method() !== 'GET' || route.request().url().includes('/states')) {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(COUNTRY_STATE_FIXTURES.countries),
    });
  });
}

/** Seed zustand persist before first navigation so country Autocomplete is never empty. */
export async function installCountryStateBootstrap(page: Page): Promise<void> {
  await ensureCountryStateApiMock(page);

  if (bootstrappedPages.has(page)) return;
  bootstrappedPages.add(page);

  const payload = countryStoragePayload();
  await page.addInitScript((storageJson) => {
    try {
      const existing = localStorage.getItem('country-storage');
      const parsed = existing ? JSON.parse(existing) : null;
      const countries = parsed?.state?.countries;
      if (!Array.isArray(countries) || countries.length === 0) {
        localStorage.setItem('country-storage', storageJson);
      }
    } catch {
      localStorage.setItem('country-storage', storageJson);
    }
  }, payload);
}

/**
 * Investor-details mount can reuse an empty country-storage from a failed CSC fetch.
 * Reload once (before any fields are filled) so zustand rehydrates seeded countries.
 */
export async function ensureAddressCatalogReady(page: Page): Promise<void> {
  await installCountryStateBootstrap(page);

  const catalogReady = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('country-storage');
      const countries = JSON.parse(raw ?? '{}')?.state?.countries;
      return Array.isArray(countries) && countries.length > 0;
    } catch {
      return false;
    }
  });

  if (!catalogReady) {
    await page.evaluate((storageJson) => {
      localStorage.setItem('country-storage', storageJson);
    }, countryStoragePayload());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText('Investor Details').first().waitFor({ state: 'visible', timeout: 60_000 });
  }

  await page
    .waitForResponse(
      (r) =>
        r.url().includes('countrystatecity.in') &&
        r.url().includes('/states') &&
        r.request().method() === 'GET' &&
        r.ok(),
      { timeout: 60_000 },
    )
    .catch(() => null);
}
