import { expect, type Locator, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { fetchJsonOnAction } from '../helpers/fetch-json-on-reload';
import {
  assertApplicationListMatchesApi,
  normalizeApplicationListPayload,
  parseApplicationTableRows,
} from '../helpers/applications/application-list';
import {
  applicationListColumns,
  APPLICATIONS_SUPPORTED_PERSONAS,
  hasApplicationListFilters,
  SORTABLE_APPLICATION_COLUMNS,
  usesStaffApplicationApi,
  type ApplicationListItem,
} from '../helpers/applications/types';

export class ApplicationsPage {
  private lastApiRows: ApplicationListItem[] = [];

  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    return this.persona === 'investor' ? '/investor' : '/adviser';
  }

  private matchesApplicationListApi() {
    return (res: import('@playwright/test').Response) => {
      if (res.request().method() !== 'POST' || !res.ok()) return false;

      const url = res.url();
      const isStaff =
        usesStaffApplicationApi(this.persona) && /KiStaff\/all-tenant/i.test(url);
      const isTenant = !usesStaffApplicationApi(this.persona) && url.includes('/application/list');
      return isStaff || isTenant;
    };
  }

  private async captureListApi(
    action: () => Promise<void>,
    options?: { timeout?: number },
  ): Promise<ApplicationListItem[]> {
    const payload = await fetchJsonOnAction<unknown>(
      this.page,
      this.matchesApplicationListApi(),
      action,
      options,
    );
    const rows = normalizeApplicationListPayload(payload);
    this.lastApiRows = rows;
    return rows;
  }

  private async reloadList(): Promise<ApplicationListItem[]> {
    return this.captureListApi(async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    });
  }

  private tableBodyRows() {
    return this.page.locator('table tbody tr');
  }

  private searchInput() {
    return this.page.getByPlaceholder('Search by application id or applicant name');
  }

  private pageTitle() {
    return this.page.getByText('Applications', { exact: true });
  }

  private filterToggleButton() {
    return this.searchInput()
      .locator('xpath=ancestor::div[contains(@class,"MuiBox-root")][1]/preceding-sibling::div[1]//button')
      .first();
  }

  private filtersRoot() {
    return this.page.locator('.MuiDrawer-paper');
  }

  async open(): Promise<void> {
    if (!APPLICATIONS_SUPPORTED_PERSONAS.has(this.persona)) {
      throw new Error(`Applications page is not configured for persona "${this.persona}" yet`);
    }

    const timeout = usesStaffApplicationApi(this.persona) ? 120_000 : 60_000;
    await this.captureListApi(async () => {
      await this.page.goto(`${this.routePrefix()}/application`);
    }, { timeout });
    await this.assertLoaded();
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.routePrefix()}/application`));
    await expect(this.page.locator('table').first()).toBeVisible({ timeout: 60_000 });
    await expect(this.tableBodyRows().first()).toBeVisible({ timeout: 60_000 });
  }

  async isEmptyApplicationTable(): Promise<boolean> {
    const text = (await this.tableBodyRows().first().textContent()) ?? '';
    return /no records/i.test(text);
  }

  private rowHasPopulatedCells(cells: string[]): boolean {
    const text = cells.join(' ').trim();
    return text.length > 2 && !/no records/i.test(text);
  }

  private async waitForTableRowsPopulated(): Promise<void> {
    await this.page
      .getByRole('progressbar', { name: /no records to display/i })
      .waitFor({ state: 'hidden', timeout: 120_000 })
      .catch(() => {});

    await expect
      .poll(
        async () => {
          if (await this.isEmptyApplicationTable()) {
            return false;
          }
          const rows = this.tableBodyRows();
          const count = await rows.count();
          for (let i = 0; i < count; i++) {
            const cells = await rows.nth(i).locator('td').allTextContents();
            if (this.rowHasPopulatedCells(cells.map((cell) => cell.trim()))) {
              return true;
            }
          }
          return false;
        },
        { timeout: usesStaffApplicationApi(this.persona) ? 120_000 : 60_000 },
      )
      .toBe(true);
  }

  async readVisibleTableRows(): Promise<Array<Record<string, string>>> {
    if (await this.isEmptyApplicationTable()) {
      return [];
    }

    const rows = this.tableBodyRows();
    const parsed: string[][] = [];
    const count = await rows.count();
    const columns = applicationListColumns(this.persona);

    for (let i = 0; i < count; i++) {
      const cells = await rows.nth(i).locator('td').allTextContents();
      const trimmed = cells.map((cell) => cell.trim());
      if (!this.rowHasPopulatedCells(trimmed)) {
        continue;
      }
      parsed.push(trimmed.slice(0, columns.length));
    }

    return parseApplicationTableRows(parsed, columns);
  }

  async verifyTableColumns(): Promise<void> {
    for (const header of applicationListColumns(this.persona)) {
      await expect(this.page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  }

  async verifyTableDataMatchesApi(): Promise<void> {
    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    await this.waitForTableRowsPopulated();
    const uiRows = await this.readVisibleTableRows();
    assertApplicationListMatchesApi(uiRows, apiRows);
  }

  async verifySearch(): Promise<void> {
    const apiRows = this.lastApiRows.length ? this.lastApiRows : await this.reloadList();
    const first = apiRows[0];
    const query = first.displayId ?? (first.owner ?? '').split(' ')[0] ?? '';
    expect(query.length, 'Need an application search term').toBeGreaterThan(1);

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
    const columns = applicationListColumns(this.persona).filter((col) =>
      SORTABLE_APPLICATION_COLUMNS.includes(col as (typeof SORTABLE_APPLICATION_COLUMNS)[number]),
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

  async exportApplicationListExcel(): Promise<void> {
    await this.page.getByTitle('Export List').click();
    const dialog = this.exportDialog();
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole('radio', { name: /Excel/i }).check();

    const [download] = await Promise.all([
      this.page.context().waitForEvent('download', { timeout: 120_000 }),
      dialog.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^applications_list\.xlsx$/i);
    await expect(this.exportDialog()).toBeHidden({ timeout: 15_000 });
  }

  async ensureFiltersPanelOpen(): Promise<void> {
    if (!hasApplicationListFilters(this.persona)) {
      return;
    }

    const drawer = this.filtersRoot();
    const dateRange = drawer.getByText('Date Range', { exact: true });
    if (await dateRange.isVisible()) {
      return;
    }

    await this.filterToggleButton().click();
    await expect(drawer.getByText('Date Range', { exact: true })).toBeVisible({ timeout: 15_000 });
  }

  async closeFiltersPanel(): Promise<void> {
    const drawer = this.page.locator('.MuiDrawer-paper');
    if (await drawer.isVisible()) {
      await this.page.keyboard.press('Escape');
      await expect(drawer).toBeHidden({ timeout: 10_000 });
    }
  }

  private filterCheckbox(name: string): Locator {
    return this.filtersRoot().locator(`input[type="checkbox"][name="${name}"]`);
  }

  private async expandDateRange(): Promise<void> {
    const dateRangeHeader = this.filtersRoot().getByText('Date Range', { exact: true });
    await dateRangeHeader.scrollIntoViewIfNeeded();
    const expandButton = dateRangeHeader.locator('xpath=ancestor::div[contains(@class,"MuiBox-root")][1]//button').first();
    await expandButton.click().catch(() => {});
    await expect(this.filtersRoot().getByText('From', { exact: true })).toBeVisible({ timeout: 10_000 });
  }

  async verifyFilters(): Promise<void> {
    if (!hasApplicationListFilters(this.persona)) {
      await expect(this.filterToggleButton()).toHaveCount(0);
      return;
    }

    await this.ensureFiltersPanelOpen();
    await this.expandDateRange();
    await expect(this.filtersRoot().getByText('To', { exact: true })).toBeVisible();

    if (this.persona === 'admin') {
      await expect(this.filtersRoot().getByText('Funeral Homes', { exact: true })).toBeVisible();
      await expect(this.filtersRoot().getByText('Financial Advisers', { exact: true })).toBeVisible();
      await expect(this.filtersRoot().getByText('Product Type', { exact: true })).toBeVisible();

      const funeralCheckbox = this.filtersRoot()
        .getByText('Funeral Homes', { exact: true })
        .locator('xpath=ancestor::div[contains(@class,"MuiStack-root")][1]')
        .locator('input[type="checkbox"]')
        .first();
      if (await funeralCheckbox.isVisible()) {
        await this.captureListApi(() => funeralCheckbox.check());
        await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
        await funeralCheckbox.uncheck();
      }
    }

    if (this.persona === 'adviser') {
      await expect(this.filtersRoot().getByText('Product Type', { exact: true })).toBeVisible();
      await expect(this.filtersRoot().getByText('Application Status', { exact: true })).toBeVisible();
      await this.captureListApi(() => this.filterCheckbox('FB').check());
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await this.filterCheckbox('FB').uncheck();
    }

    if (this.persona === 'funeral') {
      await expect(this.filtersRoot().getByText('Application Status', { exact: true })).toBeVisible();
      await this.captureListApi(() => this.filterCheckbox('PREPAID').check());
      await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await this.filterCheckbox('PREPAID').uncheck();
    }

    await this.captureListApi(() => this.filterCheckbox('APPROVED').check(), {
      timeout: usesStaffApplicationApi(this.persona) ? 120_000 : 60_000,
    });
    await this.page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    await expect(this.tableBodyRows().first()).toBeVisible();

    if (this.persona !== 'admin') {
      await expect
        .poll(async () => {
          const rows = this.tableBodyRows();
          const count = await rows.count();
          if (count === 0) return true;
          for (let i = 0; i < count; i++) {
            const text = ((await rows.nth(i).textContent()) ?? '').toLowerCase();
            if (!text.includes('approved')) return false;
          }
          return true;
        })
        .toBe(true);
    }

    await this.filterCheckbox('APPROVED').uncheck();
    await this.closeFiltersPanel();
  }

  async verifyPagination(): Promise<void> {
    await this.closeFiltersPanel();

    if (await this.isEmptyApplicationTable()) {
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

  private async resolveApplicationForRow(
    rowIndex: number,
  ): Promise<{ applicationId: string; displayId: string }> {
    const row = this.tableBodyRows().nth(rowIndex);
    const rowText = (await row.textContent()) ?? '';
    const applicantName = ((await row.locator('td').first().textContent()) ?? '').trim();

    for (const apiRow of this.lastApiRows) {
      const applicationId = String(apiRow.id ?? '');
      const displayId = apiRow.displayId ?? applicationId;
      if (displayId && rowText.includes(displayId)) {
        return { applicationId, displayId };
      }
      const owner = apiRow.owner?.trim();
      if (owner) {
        const firstName = owner.split(' ')[0] ?? '';
        if (rowText.includes(owner) || applicantName.includes(firstName)) {
          return { applicationId, displayId };
        }
      }
    }

    const fallback = this.lastApiRows.find((apiRow) => apiRow.id);
    expect(fallback?.id, 'Application id from API').toBeTruthy();
    const applicationId = String(fallback!.id);
    return { applicationId, displayId: fallback!.displayId ?? applicationId };
  }

  private async findRowIndexWithStatus(statuses: string[]): Promise<number> {
    const rows = this.tableBodyRows();
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = (await rows.nth(i).textContent()) ?? '';
      if (statuses.some((status) => text.includes(status))) {
        return i;
      }
    }
    return 0;
  }

  async openApplicationDetail(rowIndex?: number): Promise<{ applicationId: string; displayId: string }> {
    await this.ensureListLoaded();

    const index = rowIndex ?? (await this.findRowIndexWithStatus(['Approved', 'Submitted', 'Draft']));
    const row = this.tableBodyRows().nth(index);
    await expect(row).toBeVisible();
    await expect(row.getByText('No records', { exact: false })).toHaveCount(0);

    const { applicationId, displayId } = await this.resolveApplicationForRow(index);

    try {
      await Promise.all([
        this.page.waitForURL(new RegExp(`/application/view/${applicationId}`), {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        }),
        row.getByText('View Details', { exact: true }).click(),
      ]);
    } catch {
      await this.page.goto(`${this.routePrefix()}/application/view/${applicationId}`, {
        waitUntil: 'domcontentloaded',
      });
    }

    await expect(this.page).toHaveURL(new RegExp(`/application/view/${applicationId}`));
    return { applicationId, displayId };
  }
}
