import { expect, type Locator, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import { funeralBondRadioLabel, type FuneralBondType } from '../helpers/applications/create/bond-types';
import {
  isPrepaidFuneralQuestion,
  loadTmdQuestionsForPersona,
  parseTmdAnswersCsv,
  type TmdQuestion,
} from '../helpers/applications/create/tmd.helper';

export class ApplicationCreateDialogPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private newApplicationDialog(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ hasText: /new application/i })
      .first();
  }

  private selectBondDialog(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ hasText: /keyinvest funeral bond|new application/i })
      .first();
  }

  activeDialog(): Locator {
    if (this.persona === 'guest' || this.persona === 'investor') {
      return this.selectBondDialog();
    }
    return this.newApplicationDialog();
  }

  async acceptGuestTermsIfShown(): Promise<void> {
    if (this.persona !== 'guest') return;
    const accept = this.page.getByRole('button', { name: /^accept$/i });
    if (await accept.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await accept.click();
    }
  }

  async openGuestFuneralBondFlow(): Promise<void> {
    await this.acceptGuestTermsIfShown();
    await this.page.getByRole('radio', { name: /^funeral bond$/i }).check();
    await expect(this.selectBondDialog()).toBeVisible({ timeout: 30_000 });
  }

  async clickCreateNewOnApplications(): Promise<void> {
    await this.page.getByRole('button', { name: /^create new$/i }).click();
    await expect(this.activeDialog()).toBeVisible({ timeout: 30_000 });
  }

  /** Adviser step 1: product picker (Funeral Bond vs Life Events Bond). */
  async selectAdviserFuneralBondTypeIfShown(): Promise<void> {
    if (this.persona !== 'adviser') return;
    const dialog = this.activeDialog();

    await expect(dialog.getByText('Select Bond Type', { exact: true })).toBeVisible({ timeout: 30_000 });
    await dialog.getByRole('progressbar').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});

    if (await this.isAdviserFuneralBondDialogReady()) {
      return;
    }

    const funeralBondRadio = dialog.getByRole('radio', { name: /funeral bond/i });
    const funeralBondInput = dialog.locator('input[type="radio"][value="Funeral"]');

    if (await funeralBondRadio.isVisible().catch(() => false)) {
      await funeralBondRadio.check();
      await expect(funeralBondRadio).toBeChecked({ timeout: 15_000 });
    } else {
      await funeralBondInput.check({ force: true });
      await expect(funeralBondInput).toBeChecked({ timeout: 15_000 });
    }

    await expect.poll(async () => this.isAdviserFuneralBondDialogReady(), { timeout: 60_000 }).toBe(true);
    await dialog.getByRole('progressbar').waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => {});
  }

  /** Funeral director: Nominated/Pre-Paid + TMD. Adviser normally uses FA declaration instead. */
  async hasFuneralBondSubtypeStep(): Promise<boolean> {
    return this.activeDialog()
      .getByText('Select Funeral Bond Type')
      .isVisible()
      .catch(() => false);
  }

  async isAdviserFaDeclarationPath(): Promise<boolean> {
    if (this.persona !== 'adviser') return false;
    if (await this.hasFuneralBondSubtypeStep()) return false;
    return this.activeDialog()
      .getByRole('checkbox')
      .first()
      .isVisible()
      .catch(() => false);
  }

  private async isAdviserFuneralBondDialogReady(): Promise<boolean> {
    const dialog = this.activeDialog();
    const hasSubtype = await dialog.getByText('Select Funeral Bond Type').isVisible().catch(() => false);
    const hasDeclaration = await dialog.getByRole('checkbox').first().isVisible().catch(() => false);
    const hasConfirm = await dialog.getByRole('button', { name: /^confirm$/i }).isVisible().catch(() => false);
    return hasSubtype || hasDeclaration || hasConfirm;
  }

  async selectInvestorFuneralBondIfShown(): Promise<void> {
    if (this.persona !== 'investor' && this.persona !== 'guest') return;
    const dialog = this.activeDialog();
    const funeralBond = dialog.getByRole('radio', { name: /^funeral bond$/i }).first();
    if (await funeralBond.isVisible({ timeout: 5_000 }).catch(() => false)) {
      if (!(await funeralBond.isChecked().catch(() => false))) {
        await funeralBond.check();
      }
    }
  }

  private routePrefix(): string {
    if (this.persona === 'guest') return '/guest';
    if (this.persona === 'investor') return '/investor';
    return '/adviser';
  }

  private parseApplicationIdFromBody(body: unknown): string | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const record = body as Record<string, unknown>;
    const direct = record.id ?? record.applicationId;
    if (typeof direct === 'string' && direct.length > 0) return direct;
    if (typeof direct === 'number') return String(direct);
    const nested = record.data;
    if (nested && typeof nested === 'object') {
      const nestedId = (nested as Record<string, unknown>).id;
      if (typeof nestedId === 'string' && nestedId.length > 0) return nestedId;
      if (typeof nestedId === 'number') return String(nestedId);
    }
    return undefined;
  }

  private parseApplicationIdFromUrl(): string {
    const match = this.page
      .url()
      .match(
        new RegExp(
          `${this.routePrefix()}/application/(?:funeral-bond|life-event-bond)/investor-details/([0-9a-f-]{36})`,
          'i',
        ),
      );
    if (!match?.[1]) {
      throw new Error(`Could not parse application id from URL: ${this.page.url()}`);
    }
    return match[1];
  }

  async confirmAdviserDeclarationIfShown(): Promise<void> {
    if (this.persona !== 'adviser') return;
    const checkbox = this.activeDialog().getByRole('checkbox').first();
    if (await checkbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await checkbox.check();
    }
  }

  async waitForTmdFormReady(): Promise<void> {
    const dialog = this.activeDialog();
    if (this.persona === 'funeral') {
      await dialog.getByText('Select Funeral Bond Type').waitFor({ state: 'visible', timeout: 30_000 });
    } else if (this.persona === 'adviser') {
      await expect.poll(async () => this.isAdviserFuneralBondDialogReady(), { timeout: 60_000 }).toBe(true);
    }
    await dialog.getByRole('progressbar').waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => {});
    if (this.persona === 'adviser' && !(await this.hasFuneralBondSubtypeStep())) {
      return;
    }
    await expect
      .poll(async () => dialog.getByRole('radio').count(), { timeout: 60_000 })
      .toBeGreaterThan(1);
  }

  async expectNewApplicationDialog(): Promise<void> {
    await expect(this.activeDialog()).toBeVisible({ timeout: 15_000 });
    await expect(this.activeDialog().getByText(/new application/i).first()).toBeVisible();
  }

  async selectFuneralBondType(bondType: FuneralBondType): Promise<void> {
    if (this.persona === 'guest' || this.persona === 'investor') {
      return;
    }
    const dialog = this.activeDialog();
    const radio = dialog.getByRole('radio', { name: funeralBondRadioLabel(bondType) });
    await radio.check();
    await expect(radio).toBeChecked({ timeout: 5_000 });
  }

  /** Yes/No TMD groups only — excludes bond-type radiogroups (Nominated / Pre-Paid). */
  private tmdYesNoRadiogroups(): Locator {
    return this.activeDialog()
      .getByRole('radiogroup')
      .filter({ has: this.page.getByRole('radio', { name: /^yes$/i }) });
  }

  async answerTmdQuestions(answersCsv: string, questions?: TmdQuestion[]): Promise<void> {
    const tmdQuestions = questions ?? (await loadTmdQuestionsForPersona(this.page, this.persona));
    const answers = parseTmdAnswersCsv(answersCsv);
    const groups = this.tmdYesNoRadiogroups();

    await expect(groups).toHaveCount(tmdQuestions.length, { timeout: 15_000 });

    for (let i = 0; i < tmdQuestions.length; i++) {
      const label = (answers[i] ?? answers[answers.length - 1]) === 'yes' ? 'Yes' : 'No';
      const questionText = tmdQuestions[i].question;
      const radio = groups.nth(i).getByRole('radio', { name: new RegExp(`^${label}$`, 'i') });
      await radio.click();
      await expect(radio).toBeChecked({ timeout: 5_000 });

      if (isPrepaidFuneralQuestion(questionText) && label === 'Yes') {
        const warningDialog = this.page.getByRole('dialog').filter({ hasText: /warning|centrelink|funeral bond/i });
        if (await warningDialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
          const ok = warningDialog.getByRole('button', { name: /ok|close|confirm/i }).first();
          if (await ok.isVisible().catch(() => false)) {
            await ok.click();
          }
        }
      }
    }
  }

  async answerTmdQuestionAtIndex(index: number, answer: 'yes' | 'no', questions: TmdQuestion[]): Promise<void> {
    const label = answer === 'yes' ? 'Yes' : 'No';
    const radio = this.tmdYesNoRadiogroups()
      .nth(index)
      .getByRole('radio', { name: new RegExp(`^${label}$`, 'i') });
    await radio.click();
    await expect(radio).toBeChecked({ timeout: 5_000 });
  }

  confirmButton(): Locator {
    return this.activeDialog().getByRole('button', { name: /^confirm$/i });
  }

  async expectConfirmEnabled(enabled: boolean): Promise<void> {
    const confirm = this.confirmButton();
    if (enabled) {
      await expect(confirm).toBeEnabled({ timeout: 15_000 });
    } else {
      await expect(confirm).toBeDisabled({ timeout: 15_000 });
    }
  }

  async expectWarningVisible(): Promise<void> {
    await expect(this.activeDialog().getByText(/^warning$/i).first()).toBeVisible({ timeout: 10_000 });
  }

  async expectQuestionsVisible(questions: TmdQuestion[]): Promise<void> {
    const dialog = this.activeDialog();
    for (const q of questions) {
      await expect(dialog.getByText(q.question, { exact: false })).toBeVisible({ timeout: 30_000 });
    }
    expect(questions.length).toBeGreaterThan(0);
  }

  async clickConfirmAndWaitForCreate(): Promise<string> {
    const dialog = this.activeDialog();
    const confirm = this.confirmButton();
    await expect(confirm).toBeEnabled({ timeout: 30_000 });

    const routePrefix = this.routePrefix();
    const usesFullPageNavigation = this.persona === 'guest' || this.persona === 'investor';
    const wizardUrl = new RegExp(
      `${routePrefix}/application/(?:funeral-bond|life-event-bond)/investor-details/[0-9a-f-]{36}`,
      'i',
    );

    const createResponse = this.page.waitForResponse(
      (r) => r.url().includes('/application/create') && r.request().method() === 'POST',
      { timeout: 120_000 },
    );

    if (usesFullPageNavigation) {
      await Promise.all([
        this.page.waitForURL(wizardUrl, { timeout: 120_000, waitUntil: 'commit' }),
        confirm.click(),
      ]);
      await createResponse.catch(() => null);
      return this.parseApplicationIdFromUrl();
    }

    await confirm.click();

    const response = await createResponse;
    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`POST /application/create failed (${response.status()}). Body: ${body.slice(0, 500)}`);
    }

    const json = (await response.json().catch(() => null)) as unknown;
    const applicationId = this.parseApplicationIdFromBody(json);
    if (!applicationId) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `POST /application/create returned no application id. Body: ${body.slice(0, 500)}`,
      );
    }

    await dialog.waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});

    await this.page.waitForURL(
      new RegExp(`${routePrefix}/application/funeral-bond/investor-details/${applicationId}`, 'i'),
      { timeout: 120_000, waitUntil: 'commit' },
    );

    return applicationId;
  }

  async completeTmdAndCreate(bondType: FuneralBondType, tmdAnswers: string): Promise<string> {
    await this.expectNewApplicationDialog();
    await this.selectAdviserFuneralBondTypeIfShown();
    await this.selectInvestorFuneralBondIfShown();
    await this.waitForTmdFormReady();

    if (this.persona === 'adviser' && !(await this.hasFuneralBondSubtypeStep())) {
      const confirm = this.confirmButton();
      if (!(await confirm.isEnabled().catch(() => false))) {
        await this.confirmAdviserDeclarationIfShown();
        await this.expectConfirmEnabled(true);
      }
      return this.clickConfirmAndWaitForCreate();
    }

    if (this.persona === 'guest' || this.persona === 'investor') {
      const confirm = this.confirmButton();
      if (!(await confirm.isEnabled().catch(() => false))) {
        await this.answerTmdQuestions(tmdAnswers);
        await this.expectConfirmEnabled(true);
      }
      return this.clickConfirmAndWaitForCreate();
    }

    await this.selectFuneralBondType(bondType);
    await this.answerTmdQuestions(tmdAnswers);
    return this.clickConfirmAndWaitForCreate();
  }
}
