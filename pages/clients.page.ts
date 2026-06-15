import { expect, type Locator, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnAction } from '../helpers/fetch-json-on-reload';
import {
  assertClientListMatchesApi,
  normalizeClientListPayload,
  parseClientTableRows,
  SORTABLE_TENANT_CLIENT_COLUMNS,
  TENANT_CLIENT_COLUMNS,
  usesTenantClientListApi,
} from '../helpers/clients/client-list';
import type { ClientListItem } from '../helpers/clients/types';

export const CLIENTS_SUPPORTED_PERSONAS = new Set<Persona>(['funeral', 'adviser', 'investor']);

type ClientListFilters = {
  ageRanges?: string[];
  claimStatus?: string[];
};

export class ClientsPage {
  private lastApiRows: ClientListItem[] = [];

  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    return this.persona === 'investor' ? '/investor' : '/adviser';
  }

  private usesTenantApi(): boolean {
    return usesTenantClientListApi(this.persona);
  }

  private matchesClientListApi(filters?: ClientListFilters) {
    return (res: import('@playwright/test').Response) => {
      if (!res.url().includes('/owner/first-holder-clients') || res.request().method() !== 'POST') {
        return false;
      }
      if (!filters) return true;
      const body = res.request().postDataJSON() as ClientListFilters;
      if (filters.ageRanges) {
        const expected = [...filters.ageRanges].sort().join(',');
        const actual = [...(body.ageRanges ?? [])].sort().join(',');
        if (expected !== actual) return false;
      }
      if (filters.claimStatus) {
        const expected = [...filters.claimStatus].sort().join(',');
        const actual = [...(body.claimStatus ?? [])].sort().join(',');
        if (expected !== actual) return false;
      }
      return true;
    };
  }

  private async captureListApi(action: () => Promise<void>): Promise<ClientListItem[]> {
    if (!this.usesTenantApi()) {
      throw new Error(`Tenant client list API is not used for persona "${this.persona}"`);
    }

    const payload = await fetchJsonOnAction<unknown>(this.page, this.matchesClientListApi(), action);
    const rows = normalizeClientListPayload(payload);
    this.lastApiRows = rows;
    return rows;
  }

  private async reloadList(): Promise<ClientListItem[]> {
    return this.captureListApi(async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    });
  }

  private tableBodyRows() {
    return this.page.locator('table tbody tr');
  }

  private searchInput() {
    return this.page.getByPlaceholder('Search by client name');
  }

  async open(): Promise<void> {
    if (!CLIENTS_SUPPORTED_PERSONAS.has(this.persona)) {
      throw new Error(`Clients page is not configured for persona "${this.persona}" yet`);
    }

    if (this.usesTenantApi()) {
      await this.captureListApi(async () => {
        await this.page.goto(`${this.routePrefix()}/clients`);
      });
    } else {
      await this.page.goto(`${this.routePrefix()}/clients`);
    }

    await this.assertLoaded();
  }

  async openFromNav(): Promise<void> {
    const tabName = this.persona === 'admin' ? 'Claims' : 'Clients';
    await this.page.getByRole('tab', { name: tabName }).click();
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/clients`));
    await this.assertLoaded();
  }

  private pageTitle() {
    return this.page.locator('p').filter({ hasText: /^Clients$/ });
  }

  private filterToggleButton() {
    return this.pageTitle().locator('xpath=preceding-sibling::button[1]');
  }

  private filtersRoot() {
    return this.page.locator('.MuiDrawer-paper');
  }

  async closeFiltersPanel(): Promise<void> {
    const drawer = this.filtersRoot();
    if (await drawer.isVisible()) {
      await this.page.keyboard.press('Escape');
      await expect(drawer).toBeHidden({ timeout: 10_000 });
    }
  }

  /** Filters sidebar is xl-only; below that breakpoint they live in a left drawer. */
  async ensureFiltersPanelOpen(): Promise<void> {
    const drawer = this.filtersRoot();
    const claimStatusHeading = drawer.getByText('Claim Status', { exact: true });
    if (await claimStatusHeading.isVisible()) {
      return;
    }

    await this.filterToggleButton().click();
    await expect(claimStatusHeading).toBeVisible({ timeout: 15_000 });
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/clients`));
    await expect(this.page.getByPlaceholder('Search by client name')).toBeVisible();
    await expect(this.page.locator('table').first()).toBeVisible({ timeout: 60_000 });
    await expect(this.tableBodyRows().first()).toBeVisible({ timeout: 60_000 });
  }

  async isEmptyClientTable(): Promise<boolean> {
    const text = (await this.tableBodyRows().first().textContent()) ?? '';
    return /no records/i.test(text);
  }

  async readVisibleTableRows(): Promise<Array<Record<string, string>>> {
    if (await this.isEmptyClientTable()) {
      return [];
    }

    const rows = this.tableBodyRows();
    const parsed: string[][] = [];
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator('td').allTextContents();
      const dataCells = cells.slice(0, 6);
      parsed.push(dataCells.map((cell) => cell.trim()));
    }

    return parseClientTableRows(parsed);
  }

  async verifyTableColumns(): Promise<void> {
    for (const header of TENANT_CLIENT_COLUMNS) {
      await expect(this.page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  }

  async verifyEmptyClientList(): Promise<void> {
    expect(await this.isEmptyClientTable(), 'Investor clients list should be empty').toBe(true);
    await expect(this.page.getByText('0-0 of 0')).toBeVisible();
  }

  async verifyTableDataMatchesApi(): Promise<void> {
    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    const uiRows = await this.readVisibleTableRows();
    assertClientListMatchesApi(uiRows, apiRows);
  }

  async verifySearch(): Promise<void> {
    if (!this.usesTenantApi()) {
      await this.searchInput().fill('test');
      await expect(this.page.getByText(/no records/i)).toBeVisible();
      await this.searchInput().fill('');
      await expect(this.page.getByText(/no records/i)).toBeVisible();
      return;
    }

    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    const first = apiRows[0];
    const query = (first.firstName ?? '').split(' ')[0];
    expect(query.length, 'Need a client name to search').toBeGreaterThan(1);

    await this.searchInput().fill(query);
    await expect
      .poll(async () => {
        const rows = await this.readVisibleTableRows();
        return rows.length > 0 && rows.every((row) => row.clientName.toLowerCase().includes(query.toLowerCase()));
      })
      .toBe(true);

    const filtered = await this.readVisibleTableRows();
    expect(filtered.length).toBeGreaterThan(0);

    await this.searchInput().fill('');
    const resetCount = await this.tableBodyRows().count();
    expect(resetCount).toBeGreaterThanOrEqual(filtered.length);
  }

  async verifySortableColumns(): Promise<void> {
    for (const column of SORTABLE_TENANT_CLIENT_COLUMNS) {
      const header = this.page.getByRole('columnheader', { name: column });
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

  async exportClientListExcel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Export List' }).click();
    const dialog = this.exportDialog();
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole('radio', { name: /Excel/i }).check();

    const [download] = await Promise.all([
      this.page.context().waitForEvent('download', { timeout: 90_000 }),
      dialog.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^clients_list\.xlsx$/i);
    await expect(this.exportDialog()).toBeHidden({ timeout: 15_000 });
  }

  private filterCheckbox(name: string): Locator {
    return this.filtersRoot().locator(`input[type="checkbox"][name="${name}"]`);
  }

  private clearFilterSection(sectionTitle: string): Locator {
    return this.filtersRoot()
      .getByText(sectionTitle, { exact: true })
      .locator('xpath=ancestor::div[contains(@class,"MuiStack-root")][1]')
      .getByRole('button')
      .first();
  }

  async verifyFilters(): Promise<void> {
    await this.ensureFiltersPanelOpen();

    if (!this.usesTenantApi()) {
      await expect(this.filtersRoot().getByText('Age Bracket', { exact: true })).toHaveCount(0);
      await this.filterCheckbox('SUBMITTED').check();
      await expect(this.filterCheckbox('SUBMITTED')).toBeChecked();
      await this.clearFilterSection('Claim Status').click();
      await this.closeFiltersPanel();
      return;
    }

    if (this.persona === 'funeral') {
      const apiAfterAge = await this.captureListApi(() => this.filterCheckbox('50-59').check());
      const uiAfterAge = await this.readVisibleTableRows();
      assertClientListMatchesApi(uiAfterAge, apiAfterAge, 'Age filter');

      await this.captureListApi(() => this.clearFilterSection('Age Bracket').click());
    }

    const apiAfterStatus = await this.captureListApi(() => this.filterCheckbox('SUBMITTED').check());
    const uiAfterStatus = await this.readVisibleTableRows();
    if (apiAfterStatus.length > 0) {
      assertClientListMatchesApi(uiAfterStatus, apiAfterStatus, 'Claim status filter');
    }

    await this.captureListApi(() => this.clearFilterSection('Claim Status').click());
    await this.closeFiltersPanel();
  }

  async verifyPagination(): Promise<void> {
    await this.closeFiltersPanel();

    if (!this.usesTenantApi()) {
      await expect(this.page.getByText('0-0 of 0')).toBeVisible();
      const next = this.page.getByRole('button', { name: 'Go to next page' });
      if ((await next.count()) > 0) {
        await expect(next).toBeDisabled();
      }
      return;
    }

    const totalRows = await this.tableBodyRows().count();
    expect(totalRows).toBeGreaterThan(0);

    const next = this.page.getByRole('button', { name: 'Go to next page' });
    if ((await next.count()) > 0 && (await next.isEnabled())) {
      await next.click();
      await expect(this.tableBodyRows().first()).toBeVisible();
      await this.page.getByRole('button', { name: 'Go to previous page' }).click();
    }

    await expect(this.page.getByText(/\d+[-–]\d+ of \d+/)).toBeVisible();
  }

  viewInformationButton(rowIndex = 0): Locator {
    return this.tableBodyRows().nth(rowIndex).getByText('View Information', { exact: true });
  }

  async openClientOverview(options?: {
    rowIndex?: number;
    requirePolicies?: boolean;
  }): Promise<{ clientCode: string; clientName: string }> {
    if (!this.usesTenantApi()) {
      throw new Error(`Client overview from list is not available for persona "${this.persona}"`);
    }

    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    const rowIndex = options?.rowIndex ?? 0;
    let client = apiRows[rowIndex];

    if (options?.requirePolicies) {
      client = apiRows.find((row) => (row.policyTotal ?? 0) > 0) ?? client;
    }

    const clientCode = String(client.clientCode ?? client.id ?? '');
    expect(clientCode, 'Client code required for overview navigation').toBeTruthy();

    const nameToken = (client.firstName ?? '').split(' ')[0];
    expect(nameToken.length, 'Need client name to open overview row').toBeTruthy();

    const uiRow = this.tableBodyRows().filter({ hasText: nameToken }).first();
    await Promise.all([
      this.page.waitForURL(new RegExp(`${this.routePrefix()}/clients/overview/${clientCode}`)),
      uiRow.getByText('View Information', { exact: true }).click(),
    ]);

    return { clientCode, clientName: client.firstName ?? '' };
  }
}
