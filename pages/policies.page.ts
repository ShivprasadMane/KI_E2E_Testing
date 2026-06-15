import { expect, type Locator, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnAction } from '../helpers/fetch-json-on-reload';
import {
  assertPolicyListMatchesApi,
  looksLikePolicyNumber,
  normalizePolicyListPayload,
  parsePolicyTableRows,
} from '../helpers/policies/policy-list';
import {
  hasPolicyListFilters,
  policyListColumns,
  POLICIES_SUPPORTED_PERSONAS,
  SORTABLE_POLICY_COLUMNS,
  usesStaffPolicyApi,
  type PolicyListItem,
} from '../helpers/policies/types';

type TenantPolicyFilters = {
  product?: string[];
  claimStatus?: string[];
  status?: string[];
};

type StaffPolicyFilters = {
  advisorcode?: string[];
};

export class PoliciesPage {
  private lastApiRows: PolicyListItem[] = [];

  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    return this.persona === 'investor' ? '/investor' : '/adviser';
  }

  private matchesPolicyListApi(filters?: TenantPolicyFilters | StaffPolicyFilters) {
    return (res: import('@playwright/test').Response) => {
      if (res.request().method() !== 'POST' || !res.ok()) return false;

      const url = res.url();
      const isStaff = usesStaffPolicyApi(this.persona) && url.includes('/owner/staff/policy/paginated');
      const isTenant = !usesStaffPolicyApi(this.persona) && /\/owner\/policy\/[^/?#]+/.test(url);
      if (!isStaff && !isTenant) return false;

      if (!filters) return true;

      const body = res.request().postDataJSON() as TenantPolicyFilters & {
        filters?: { advisorcode?: string[] };
      };

      if ('advisorcode' in filters && filters.advisorcode) {
        const expected = [...filters.advisorcode].sort().join(',');
        const actual = [...(body.filters?.advisorcode ?? [])].sort().join(',');
        if (expected !== actual) return false;
      }

      const tenantFilters = filters as TenantPolicyFilters;
      if (tenantFilters.claimStatus) {
        const expected = [...tenantFilters.claimStatus].sort().join(',');
        const actual = [...(body.claimStatus ?? [])].sort().join(',');
        if (expected !== actual) return false;
      }
      if (tenantFilters.status) {
        const expected = [...tenantFilters.status].sort().join(',');
        const actual = [...(body.status ?? [])].sort().join(',');
        if (expected !== actual) return false;
      }
      return true;
    };
  }

  private async captureListApi(
    action: () => Promise<void>,
    filters?: TenantPolicyFilters | StaffPolicyFilters,
  ): Promise<PolicyListItem[]> {
    const payload = await fetchJsonOnAction<unknown>(this.page, this.matchesPolicyListApi(filters), action);
    const rows = normalizePolicyListPayload(payload);
    this.lastApiRows = rows;
    return rows;
  }

  private async captureStaffFilterRequest(
    action: () => Promise<void>,
    options?: { minAdvisorCodes?: number; exactAdvisorCodes?: number },
  ): Promise<{ rows: PolicyListItem[]; advisorcode: string[] }> {
    let advisorcode: string[] = [];
    const minAdvisorCodes = options?.minAdvisorCodes ?? 0;
    const exactAdvisorCodes = options?.exactAdvisorCodes;

    const payload = await fetchJsonOnAction<unknown>(this.page, (res) => {
      if (res.request().method() !== 'POST' || !res.ok()) return false;
      if (!res.url().includes('/owner/staff/policy/paginated')) return false;

      const body = res.request().postDataJSON() as { filters?: { advisorcode?: string[] } };
      const codes = body.filters?.advisorcode ?? [];
      if (exactAdvisorCodes !== undefined && codes.length !== exactAdvisorCodes) return false;
      if (codes.length < minAdvisorCodes) return false;

      advisorcode = codes;
      return true;
    }, action);

    const rows = normalizePolicyListPayload(payload);
    this.lastApiRows = rows;
    return { rows, advisorcode };
  }

  private async readPaginationTotal(): Promise<number> {
    const text = (await this.page.getByText(/\d+[-–]\d+ of \d+/).textContent()) ?? '';
    const match = text.match(/of\s+(\d+)/i);
    return match ? Number(match[1]) : 0;
  }

  private async reloadList(): Promise<PolicyListItem[]> {
    return this.captureListApi(async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    });
  }

  private tableBodyRows() {
    return this.page.locator('table tbody tr');
  }

  private searchInput() {
    const placeholder = usesStaffPolicyApi(this.persona)
      ? 'Search by policy number, name (auto-search by portfolio code)'
      : 'Search by policy number, name';
    return this.page.getByPlaceholder(placeholder);
  }

  private pageTitle() {
    return this.page.locator('p').filter({ hasText: /^Policies$/ });
  }

  private filterToggleButton() {
    return this.pageTitle().locator('xpath=preceding-sibling::button[1]');
  }

  private filtersRoot() {
    return this.page.locator('.MuiDrawer-paper');
  }

  async open(): Promise<void> {
    if (!POLICIES_SUPPORTED_PERSONAS.has(this.persona)) {
      throw new Error(`Policies page is not configured for persona "${this.persona}" yet`);
    }

    await this.page.goto(`${this.routePrefix()}/policies`, { waitUntil: 'domcontentloaded' });
    await this.assertLoaded();

    if (!this.lastApiRows.length) {
      await this.reloadList();
    }
  }

  async openFromNav(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Policies' }).click();
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/policies`));
    await this.assertLoaded();
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/policies`));
    await expect(this.page.locator('table').first()).toBeVisible({ timeout: 60_000 });
    await expect(this.tableBodyRows().first()).toBeVisible({ timeout: 60_000 });
  }

  async isEmptyPolicyTable(): Promise<boolean> {
    const text = (await this.tableBodyRows().first().textContent()) ?? '';
    return /no records/i.test(text);
  }

  async readVisibleTableRows(): Promise<Array<Record<string, string>>> {
    if (await this.isEmptyPolicyTable()) {
      return [];
    }

    const rows = this.tableBodyRows();
    const parsed: string[][] = [];
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator('td').allTextContents();
      const dataCells = cells.slice(0, policyListColumns(this.persona).length);
      parsed.push(dataCells.map((cell) => cell.trim()));
    }

    return parsePolicyTableRows(parsed, policyListColumns(this.persona));
  }

  async verifyTableColumns(): Promise<void> {
    for (const header of policyListColumns(this.persona)) {
      await expect(this.page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  }

  async verifyTableDataMatchesApi(): Promise<void> {
    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    const uiRows = await this.readVisibleTableRows();
    assertPolicyListMatchesApi(uiRows, apiRows);
  }

  async verifySearch(): Promise<void> {
    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    const first = apiRows[0];
    const query = first.portfoliocode ?? (first.portfolioname ?? '').split(' ')[0] ?? '';
    expect(query.length, 'Need a policy search term').toBeGreaterThan(1);

    await this.searchInput().fill(query);
    await expect
      .poll(async () => {
        const rows = await this.readVisibleTableRows();
        const needle = query.toLowerCase();
        return (
          rows.length > 0 &&
          rows.every((row) => Object.values(row).some((v) => v.toLowerCase().includes(needle)))
        );
      })
      .toBe(true);

    await this.searchInput().fill('');
  }

  async verifySortableColumns(): Promise<void> {
    const columns = policyListColumns(this.persona).filter((col) =>
      SORTABLE_POLICY_COLUMNS.includes(col as (typeof SORTABLE_POLICY_COLUMNS)[number]),
    );

    for (const column of columns) {
      const header = this.page.getByRole('columnheader', { name: column });
      if ((await header.count()) === 0) continue;
      await header.scrollIntoViewIfNeeded();
      await header.click();
      await expect(this.tableBodyRows().first()).toBeVisible();
      await header.click();
      await expect(this.tableBodyRows().first()).toBeVisible();
    }
  }

  private exportDialog() {
    return this.page.getByRole('dialog').filter({ hasText: 'Export Report' });
  }

  async exportPolicyListExcel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Export List' }).click();
    const dialog = this.exportDialog();
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole('radio', { name: /Excel/i }).check();

    const [download] = await Promise.all([
      this.page.context().waitForEvent('download', { timeout: 120_000 }),
      dialog.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^policies_list\.xlsx$/i);
    await expect(this.exportDialog()).toBeHidden({ timeout: 15_000 });
  }

  async ensureFiltersPanelOpen(): Promise<void> {
    if (!hasPolicyListFilters(this.persona)) {
      return;
    }

    const drawer = this.filtersRoot();
    if (this.persona === 'admin') {
      const funeralHome = drawer.getByText('Funeral home', { exact: true });
      if (await funeralHome.isVisible()) return;
      await this.filterToggleButton().click();
      await expect(funeralHome).toBeVisible({ timeout: 15_000 });
      return;
    }

    const claimStatus = drawer.getByText('Claim Status', { exact: true });
    if (await claimStatus.isVisible()) return;
    await this.filterToggleButton().click();
    await expect(claimStatus).toBeVisible({ timeout: 15_000 });
  }

  async closeFiltersPanel(): Promise<void> {
    const drawer = this.filtersRoot();
    if (await drawer.isVisible()) {
      await this.page.keyboard.press('Escape');
      await expect(drawer).toBeHidden({ timeout: 10_000 });
    }
  }

  private filterCheckbox(label: string): Locator {
    return this.filtersRoot().getByRole('checkbox', { name: label, exact: true });
  }

  private filterSection(title: string): Locator {
    return this.filtersRoot()
      .getByText(title, { exact: true })
      .locator('xpath=ancestor::div[contains(@class,"MuiStack-root")][1]');
  }

  async verifyFilters(): Promise<void> {
    if (!hasPolicyListFilters(this.persona)) {
      await expect(this.filterToggleButton()).toHaveCount(0);
      return;
    }

    await this.ensureFiltersPanelOpen();

    if (this.persona === 'admin') {
      await expect(this.filtersRoot().getByText('Funeral home', { exact: true })).toBeVisible();
      await expect(this.filtersRoot().getByText('Financial Advisers', { exact: true })).toBeVisible();

      const funeralSection = this.filterSection('Funeral home');
      const adviserSection = this.filterSection('Financial Advisers');
      const funeralCheckboxes = funeralSection.locator('input[type="checkbox"]');
      const adviserCheckboxes = adviserSection.locator('input[type="checkbox"]');

      expect(await funeralCheckboxes.count(), 'Funeral home filter options').toBeGreaterThan(0);
      expect(await adviserCheckboxes.count(), 'Financial adviser filter options').toBeGreaterThan(0);

      const funeralCheckbox = funeralCheckboxes.first();
      const funeralLabel = (await funeralSection.locator('p, span').nth(1).textContent())?.trim() ?? '';
      expect(funeralLabel.length, 'Funeral home label').toBeGreaterThan(0);

      const funeralResult = await this.captureStaffFilterRequest(() => funeralCheckbox.check(), {
        exactAdvisorCodes: 1,
      });
      expect(funeralResult.advisorcode.length, 'Funeral home sends advisorcode filter').toBe(1);
      expect(funeralResult.rows.length, 'Funeral home API returns policies').toBeGreaterThan(0);
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await expect(this.tableBodyRows().first()).toBeVisible();
      expect(await this.readPaginationTotal(), 'Funeral home filtered total').toBeGreaterThan(0);

      await this.captureStaffFilterRequest(() => funeralCheckbox.uncheck(), { exactAdvisorCodes: 0 });

      const adviserCheckbox = adviserCheckboxes.first();
      const adviserLabel = (await adviserSection.locator('p, span').nth(1).textContent())?.trim() ?? '';
      expect(adviserLabel.length, 'Financial adviser label').toBeGreaterThan(0);

      const adviserResult = await this.captureStaffFilterRequest(() => adviserCheckbox.check(), {
        exactAdvisorCodes: 1,
      });
      expect(adviserResult.advisorcode.length, 'Financial adviser sends advisorcode filter').toBe(1);
      expect(adviserResult.rows.length, 'Financial adviser API returns policies').toBeGreaterThan(0);
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await expect(this.tableBodyRows().first()).toBeVisible();
      expect(await this.readPaginationTotal(), 'Financial adviser filtered total').toBeGreaterThan(0);
      expect(adviserResult.advisorcode[0], 'Adviser filter uses a different tenant code').not.toBe(
        funeralResult.advisorcode[0],
      );

      await adviserCheckbox.uncheck();
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await this.closeFiltersPanel();
      return;
    }

    if (this.persona === 'adviser') {
      await expect(this.filtersRoot().getByText('Product Type', { exact: true })).toBeVisible();
      await expect(this.filtersRoot().getByText('Claim Status', { exact: true })).toBeVisible();
      await expect(this.filtersRoot().getByText('Status', { exact: true })).toBeVisible();
      await this.filterCheckbox('Funeral Bonds').check().catch(() => {});
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await this.filterCheckbox('Funeral Bonds').uncheck().catch(() => {});
    }

    await this.filterCheckbox('Not Submitted').uncheck();
    await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    await expect
      .poll(async () => {
        const rows = await this.readVisibleTableRows();
        return (
          rows.length > 0 &&
          rows.every((row) => !(row['Claim Status'] ?? '').toLowerCase().includes('not submitted'))
        );
      })
      .toBe(true);

    await this.filterCheckbox('Closed').uncheck();
    await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    await this.closeFiltersPanel();
  }

  async verifyPagination(): Promise<void> {
    await this.closeFiltersPanel();

    if (await this.isEmptyPolicyTable()) {
      await expect(this.page.getByText('0-0 of 0')).toBeVisible();
      return;
    }

    await expect(this.page.getByText(/\d+[-–]\d+ of \d+/)).toBeVisible();

    const next = this.page.getByRole('button', { name: 'Go to next page' });
    if ((await next.count()) > 0 && (await next.isEnabled())) {
      await next.click();
      await expect(this.tableBodyRows().first()).toBeVisible();
      await this.page.getByRole('button', { name: 'Go to previous page' }).click();
    }
  }

  async ensureListLoaded(): Promise<void> {
    if (!this.lastApiRows.length) {
      await this.reloadList();
    }
  }

  private async findRowIndexWithPolicyNumber(): Promise<number> {
    const rows = this.tableBodyRows();
    const count = await rows.count();

    for (const apiRow of this.lastApiRows) {
      const code = apiRow.portfoliocode?.trim();
      if (!code) continue;
      for (let i = 0; i < count; i++) {
        const text = (await rows.nth(i).textContent()) ?? '';
        if (text.includes(code)) {
          return i;
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator('td').allTextContents();
      for (const cell of cells) {
        if (looksLikePolicyNumber(cell)) {
          return i;
        }
      }
    }

    for (const apiRow of this.lastApiRows) {
      const name = apiRow.portfolioname?.trim();
      if (!name) continue;
      const firstName = name.split(' ')[0] ?? '';
      for (let i = 0; i < count; i++) {
        const rowText = (await rows.nth(i).textContent()) ?? '';
        if (rowText.includes(name) || (firstName.length > 1 && rowText.includes(firstName))) {
          return i;
        }
      }
    }

    throw new Error('Policies table has no row with a recognizable policy number');
  }

  private async resolvePolicyCode(rowIndex: number): Promise<string> {
    const row = this.tableBodyRows().nth(rowIndex);
    const cells = await row.locator('td').allTextContents();
    for (const cell of cells) {
      const trimmed = cell.trim();
      if (looksLikePolicyNumber(trimmed)) {
        return trimmed;
      }
    }

    const rowText = (await row.textContent()) ?? '';
    for (const apiRow of this.lastApiRows) {
      const code = apiRow.portfoliocode?.trim();
      if (!code) continue;
      if (rowText.includes(code)) {
        return code;
      }
      const name = apiRow.portfolioname?.trim();
      const firstName = name?.split(' ')[0] ?? '';
      if (name && (rowText.includes(name) || (firstName.length > 1 && rowText.includes(firstName)))) {
        return code;
      }
    }

    const fallback = this.lastApiRows.find((apiRow) => apiRow.portfoliocode)?.portfoliocode?.trim();
    if (fallback) {
      return fallback;
    }

    throw new Error('Could not resolve policy number for policies table row');
  }

  async openPolicyDetail(rowIndex?: number): Promise<string> {
    await this.ensureListLoaded();

    const index = rowIndex ?? (await this.findRowIndexWithPolicyNumber());
    const row = this.tableBodyRows().nth(index);
    await expect(row).toBeVisible();
    await expect(row.getByText('No records', { exact: false })).toHaveCount(0);

    const portfoliocode = await this.resolvePolicyCode(index);
    const detailUrl = `${this.routePrefix()}/policies/detail/${portfoliocode}`;

    try {
      await Promise.all([
        this.page.waitForURL(new RegExp(`/policies/detail/${portfoliocode}`), {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        }),
        row.getByText('View Details', { exact: true }).click(),
      ]);
    } catch {
      await this.page.goto(detailUrl, { waitUntil: 'domcontentloaded' });
    }

    await expect(this.page).toHaveURL(new RegExp(`/policies/detail/${portfoliocode}`));
    return portfoliocode;
  }
}
