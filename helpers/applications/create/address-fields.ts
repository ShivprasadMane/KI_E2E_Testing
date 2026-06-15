import { expect, type Locator, type Page } from '@playwright/test';
import { ensureAddressCatalogReady } from './mock-country-state-api';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function closeOpenMenus(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.locator('#menu-title').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
}

/** Policy-owner fields — scoped to tab panel when present (adviser), else whole form (funeral). */
async function investorFormScope(page: Page): Promise<Locator> {
  const tabpanel = page.getByRole('tabpanel').first();
  if ((await tabpanel.count()) > 0) {
    return tabpanel;
  }
  return page.locator('form').first();
}

function labeledField(scope: Locator, labelPattern: RegExp): Locator {
  return scope.locator('p', { hasText: labelPattern }).locator('..').first();
}

async function residentialCountryField(page: Page): Promise<Locator> {
  return labeledField(await investorFormScope(page), /^Country/);
}

async function residentialStateField(page: Page): Promise<Locator> {
  return labeledField(await investorFormScope(page), /^State/);
}

async function openCountryAutocomplete(page: Page): Promise<void> {
  const field = await residentialCountryField(page);
  const combobox = field.getByRole('combobox').first();
  await combobox.click();

  const listbox = page.getByRole('listbox');
  if (await listbox.isVisible().catch(() => false)) {
    return;
  }

  const openButton = field.getByRole('button', { name: /^open$/i }).first();
  if (await openButton.isVisible().catch(() => false)) {
    await openButton.click();
  }
}

async function waitForCountryOptions(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        await closeOpenMenus(page);
        await openCountryAutocomplete(page);

        if (await page.getByText('No options', { exact: true }).isVisible().catch(() => false)) {
          await closeOpenMenus(page);
          return 0;
        }

        const listbox = page.getByRole('listbox');
        if (!(await listbox.isVisible().catch(() => false))) {
          await closeOpenMenus(page);
          return 0;
        }

        const count = await listbox.getByRole('option').count();
        await closeOpenMenus(page);
        return count;
      },
      { timeout: 30_000, intervals: [300, 600, 1000] },
    )
    .toBeGreaterThan(0);
}

async function waitForStateOptions(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        await closeOpenMenus(page);
        const field = await residentialStateField(page);
        await field.getByRole('combobox').first().click();

        const listbox = page.getByRole('listbox');
        if (!(await listbox.isVisible().catch(() => false))) {
          await closeOpenMenus(page);
          return 0;
        }

        const count = await listbox
          .getByRole('option')
          .filter({ hasNotText: /^select state$/i })
          .count();
        await closeOpenMenus(page);
        return count;
      },
      { timeout: 30_000, intervals: [300, 600, 1000] },
    )
    .toBeGreaterThan(0);
}

/** CustomAutocomplete (Country). */
async function selectResidentialCountry(page: Page, country: string): Promise<void> {
  const field = await residentialCountryField(page);
  const combobox = field.getByRole('combobox').first();
  if (!(await combobox.isVisible({ timeout: 10_000 }).catch(() => false))) {
    return;
  }

  const current = ((await combobox.inputValue().catch(() => '')) || '').trim();
  if (current.toLowerCase() === country.toLowerCase()) {
    return;
  }

  const statesFetch = page
    .waitForResponse(
      (r) =>
        r.url().includes('countrystatecity.in') &&
        r.url().includes('/states') &&
        r.request().method() === 'GET' &&
        r.ok(),
      { timeout: 30_000 },
    )
    .catch(() => null);

  await openCountryAutocomplete(page);
  await combobox.fill(country);

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible({ timeout: 15_000 });
  await listbox
    .getByRole('option', { name: new RegExp(`^${escapeRegex(country)}$`, 'i') })
    .first()
    .click();
  await statesFetch;
  await closeOpenMenus(page);
}

/** CustomSelect (State) — MUI Select listbox. */
async function selectResidentialState(page: Page, state: string): Promise<void> {
  await closeOpenMenus(page);
  const field = await residentialStateField(page);
  await field.getByRole('combobox').first().click();

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible({ timeout: 30_000 });
  await listbox
    .getByRole('option', { name: new RegExp(`^${escapeRegex(state)}$`, 'i') })
    .first()
    .click();
  await closeOpenMenus(page);
}

/** Country (Autocomplete) then State (Select). */
export async function fillResidentialCountryAndState(
  page: Page,
  country: string,
  state: string,
): Promise<void> {
  await waitForCountryOptions(page);
  await selectResidentialCountry(page, country);
  await waitForStateOptions(page);
  await selectResidentialState(page, state);
}

/** Title and other plain CustomSelect fields in the investor form. */
export async function selectInvestorCustomSelect(
  page: Page,
  placeholder: string,
  optionLabel: string,
): Promise<void> {
  await closeOpenMenus(page);
  const scope = await investorFormScope(page);
  const trigger = scope.getByRole('combobox', { name: new RegExp(placeholder, 'i') }).first();

  if (await trigger.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await trigger.click();
  } else {
    await page.getByText(placeholder, { exact: false }).first().click();
  }

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible({ timeout: 30_000 });
  await listbox
    .getByRole('option', { name: new RegExp(`^${escapeRegex(optionLabel)}$`, 'i') })
    .first()
    .click();
  await closeOpenMenus(page);
}

export { ensureAddressCatalogReady };
