import fs from 'fs';
import path from 'path';
import { expect, type Locator, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';
import type { CreateApplicationFormData } from '../helpers/applications/create/form-data.types';
import { amountDisplayPattern } from '../helpers/applications/create/format-amount';
import {
  ensureAddressCatalogReady,
  fillResidentialCountryAndState,
  selectInvestorCustomSelect,
} from '../helpers/applications/create/address-fields';
import { parseNumericInput, setReactControlledInput } from '../helpers/applications/create/set-react-input';
import { dobToIso } from '../helpers/applications/create/map-excel-to-form';
import { wizardUrlPattern } from '../helpers/applications/create/routes';
import type { ApplicationSubmissionResult } from '../helpers/applications/create/submission-result';
import { getRepoRoot } from '../projects/keyinvest/project.config';

export class ApplicationCreatePage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private routePrefix(): string {
    if (this.persona === 'guest') return '/guest';
    if (this.persona === 'investor') return '/investor';
    return '/adviser';
  }

  getApplicationId(): string {
    const match = this.page.url().match(
      new RegExp(`${this.routePrefix()}/application/funeral-bond/[^/]+/([0-9a-f-]{36})`, 'i'),
    );
    if (!match?.[1]) {
      throw new Error(`Could not parse application id from URL: ${this.page.url()}`);
    }
    return match[1];
  }

  async waitForStep(step: Parameters<typeof wizardUrlPattern>[0]): Promise<void> {
    const id = this.getApplicationId();
    await this.page.waitForURL(
      new RegExp(`${this.routePrefix()}/application/funeral-bond/${step}/${id}`, 'i'),
      { timeout: 120_000, waitUntil: 'commit' },
    );
  }

  private async closeOpenMenus(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.locator('#menu-title').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  private async fillDateOfBirth(isoDate: string): Promise<void> {
    await this.closeOpenMenus();
    const hiddenInput = this.page.locator('input[name="dateofbirth"]');
    if ((await hiddenInput.count()) > 0) {
      await hiddenInput.evaluate((el, value) => {
        const input = el as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, isoDate);
    }

    const day = isoDate.split('-')[2];
    const month = isoDate.split('-')[1];
    const year = isoDate.split('-')[0];
    const daySpin = this.page.getByRole('spinbutton', { name: 'Day' });
    if (await daySpin.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await daySpin.fill(day);
      await this.page.getByRole('spinbutton', { name: 'Month' }).fill(month);
      await this.page.getByRole('spinbutton', { name: 'Year' }).fill(year);
      await this.page.keyboard.press('Enter');
    }
  }

  async fillInvestorDetails(data: CreateApplicationFormData): Promise<void> {
    await expect(this.page.getByText('Investor Details').first()).toBeVisible({ timeout: 60_000 });
    await ensureAddressCatalogReady(this.page);

    await selectInvestorCustomSelect(this.page, 'Select Title', data.title);
    await this.page.getByPlaceholder('Enter given name').fill(data.givenName);
    if (data.middleName) {
      await this.page.getByPlaceholder('Enter middle name').fill(data.middleName);
    }
    await this.page.getByPlaceholder('Enter surname').fill(data.surname);
    await this.fillDateOfBirth(dobToIso(data.dob));

    const genderLabel = data.gender.charAt(0).toUpperCase() + data.gender.slice(1);
    await this.page.getByRole('radio', { name: new RegExp(`^${genderLabel}$`, 'i') }).first().check();

    if (data.phone) {
      await this.page.getByPlaceholder('Enter mobile/home number').fill(data.phone);
    }
    await this.page.getByPlaceholder('Enter valid email').fill(data.email);
    await this.page.getByPlaceholder('Enter street number').fill(data.streetNumber);
    await this.page.getByPlaceholder('Enter street name').fill(data.streetName);
    await this.page.getByPlaceholder('Enter street type').fill(data.streetType);
    await this.page.getByPlaceholder('Enter suburb').fill(data.suburb);
    await fillResidentialCountryAndState(this.page, data.country || 'Australia', data.state);
    await this.page.getByPlaceholder('Enter postcode').fill(data.postcode);
  }

  async saveAndProceedInvestorDetails(): Promise<void> {
    const investOptionGet = this.page.waitForResponse(
      (r) => /\/invest-option\/[0-9a-f-]{36}$/i.test(r.url()) && r.request().method() === 'GET',
      { timeout: 120_000 },
    );
    const saveResponse = this.page.waitForResponse(
      (r) =>
        r.url().includes('/owner/createInvestorDetailsAndClients') &&
        r.request().method() === 'POST',
      { timeout: 120_000 },
    );
    const saveButton = this.page.getByRole('button', { name: /save and proceed/i }).first();
    await expect(saveButton).toBeEnabled({ timeout: 30_000 });
    await saveButton.click();
    const response = await saveResponse;
    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`Saving investor details failed (${response.status()}): ${body.slice(0, 500)}`);
    }
    await this.waitForStep('investment-amount');
    await investOptionGet;
  }

  private investmentAmountInput(): Locator {
    return this.page
      .locator('input[name="initialContributionAmt"]')
      .or(this.page.getByPlaceholder('Enter investment amount'));
  }

  private investmentSaveButton(): Locator {
    return this.page.locator('.outletBox2').getByRole('button', { name: /save & proceed/i }).first();
  }

  /**
   * investOptions.tsx shows a loader until GET /invest-option hydrates the form (often with 0).
   * Caller must not type until this returns — hydration after typing wipes the amount.
   */
  async waitForInvestmentStepReady(): Promise<Locator> {
    await expect(this.page.getByRole('heading', { name: /investment details/i })).toBeVisible({
      timeout: 120_000,
    });

    const input = this.investmentAmountInput();
    await this.page.getByRole('progressbar').waitFor({ state: 'hidden', timeout: 120_000 }).catch(() => {});
    await expect(input).toBeVisible({ timeout: 120_000 });
    await expect(input).toBeEditable({ timeout: 30_000 });

    await expect
      .poll(async () => {
        const loading = await this.page.getByRole('progressbar').isVisible().catch(() => false);
        return (await input.isVisible()) && (await input.isEditable()) && !loading;
      }, { timeout: 30_000 })
      .toBe(true);

    return input;
  }

  private async ensureInvestmentAmountAccepted(amount: string): Promise<void> {
    const input = this.investmentAmountInput();
    const expected = parseNumericInput(amount);
    const saveButton = this.investmentSaveButton();
    let stableHits = 0;

    await expect
      .poll(
        async () => {
          let current = parseNumericInput(await input.inputValue());
          const enabled = await saveButton.isEnabled();

          if (current !== expected || !enabled) {
            stableHits = 0;
            if (current !== expected) {
              await setReactControlledInput(input, amount);
              current = parseNumericInput(await input.inputValue());
            }
            return false;
          }

          stableHits += 1;
          return stableHits >= 3;
        },
        { timeout: 90_000, intervals: [200, 400, 800] },
      )
      .toBe(true);
  }

  async fillInvestmentAmount(data: CreateApplicationFormData): Promise<void> {
    const input = await this.waitForInvestmentStepReady();

    const capitalCheckbox = this.page.getByRole('checkbox', {
      name: /invest in the default capital guaranteed fund only/i,
    });
    const useDefaultCapital = data.defaultCapital.trim().toUpperCase().startsWith('Y');
    if (await capitalCheckbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      if (useDefaultCapital) {
        await capitalCheckbox.check();
      } else {
        await capitalCheckbox.uncheck();
      }
    }

    await setReactControlledInput(input, data.initialAmount);
    await this.ensureInvestmentAmountAccepted(data.initialAmount);
  }

  async saveAndProceedInvestmentAmount(amount?: string): Promise<void> {
    if (amount) {
      await this.ensureInvestmentAmountAccepted(amount);
    }

    const saveButton = this.investmentSaveButton();
    const saveResponse = this.page.waitForResponse(
      (r) =>
        r.url().includes('/invest-option') &&
        (r.request().method() === 'POST' || r.request().method() === 'PATCH'),
      { timeout: 120_000 },
    );
    await saveButton.click();
    const response = await saveResponse;
    if (!response.ok()) {
      throw new Error(`Saving investment amount failed (${response.status()})`);
    }
    await this.page.waitForURL(/\/(payment-details|investment-allocation)\//i, {
      timeout: 120_000,
      waitUntil: 'commit',
    });
  }

  async fillAllocationIfShown(initialAmount: string): Promise<void> {
    if (!this.page.url().includes('investment-allocation')) return;

    await expect(this.page.getByText('Investment Allocation').first()).toBeVisible({ timeout: 60_000 });
    const capitalRow = this.page.getByRole('row').filter({ hasText: /capital guaranteed/i }).first();
    const targetRow =
      (await capitalRow.count()) > 0
        ? capitalRow
        : this.page.locator('table tbody tr').filter({ has: this.page.locator('input') }).first();

    const amountInput = targetRow.locator('input').first();
    await setReactControlledInput(amountInput, initialAmount);

    const saveResponse = this.page.waitForResponse(
      (r) => r.url().includes('/invest') && r.request().method() !== 'GET',
      { timeout: 120_000 },
    );
    await this.page.getByRole('button', { name: /save & proceed/i }).first().click();
    await saveResponse.catch(() => null);
    await this.waitForStep('payment-details');
  }

  async fillPaymentDetails(data: CreateApplicationFormData): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /payment details/i })).toBeVisible({
      timeout: 60_000,
    });

    if (data.paymentType === 'BPAY') {
      await this.page.getByRole('radio', { name: /^b\s*pay$/i }).check();
    } else if (data.paymentType === 'EFT') {
      await this.page.getByRole('radio', { name: /^eft$/i }).check();
    } else {
      await this.page.getByRole('radio', { name: /direct debit/i }).check();
      if (data.bsb) await this.page.getByPlaceholder(/bsb/i).fill(data.bsb).catch(() => {});
      if (data.accountNumber) {
        await this.page.getByPlaceholder(/account number/i).fill(data.accountNumber).catch(() => {});
      }
    }
  }

  async saveAndProceedPaymentDetails(): Promise<void> {
    const saveResponse = this.page.waitForResponse(
      (r) => /\/payment(\/|$)/i.test(r.url()) && ['POST', 'PUT', 'PATCH'].includes(r.request().method()),
      { timeout: 120_000 },
    );
    const saveButton = this.page
      .locator('.outletBox2')
      .getByRole('button', { name: /save & proceed/i })
      .first();
    await expect(saveButton).toBeEnabled({ timeout: 60_000 });
    await saveButton.click();
    await saveResponse.catch(() => null);
    await this.page.waitForURL(/\/(adviser-fees|accept-declaration)\//i, {
      timeout: 120_000,
      waitUntil: 'commit',
    });
    await this.completeAdviserFeesIfShown();
  }

  /** Adviser-only step after payment; defaults to no initial service fee. */
  async completeAdviserFeesIfShown(): Promise<void> {
    if (!this.page.url().includes('adviser-fees')) return;

    await expect(this.page.getByRole('heading', { name: /adviser fees/i })).toBeVisible({
      timeout: 60_000,
    });

    const noFee = this.page.getByRole('radio', { name: /^no$/i });
    if (!(await noFee.isChecked().catch(() => false))) {
      await noFee.check();
    }

    const saveResponse = this.page.waitForResponse(
      (r) =>
        /adviser.?fee|advisorfee/i.test(r.url()) &&
        ['POST', 'PUT', 'PATCH'].includes(r.request().method()),
      { timeout: 120_000 },
    );
    const saveButton = this.page
      .locator('.outletBox2')
      .getByRole('button', { name: /save & proceed/i })
      .first();
    await expect(saveButton).toBeEnabled({ timeout: 60_000 });
    await saveButton.click();
    await saveResponse.catch(() => null);
    await this.waitForStep('accept-declaration');
  }

  async acceptDeclarations(): Promise<void> {
    await this.completeAdviserFeesIfShown();
    // Investor/guest: GuestDeclaration ("Accept Declaration"). Funeral/adviser: accpetDecl ("Declarations").
    await expect(
      this.page.getByRole('heading', { name: /accept declaration|declarations/i }).first(),
    ).toBeVisible({ timeout: 60_000 });
    await this.page.getByRole('checkbox').first().check();

    const saveResponse = this.page.waitForResponse(
      (r) => r.url().includes('/application') && r.request().method() !== 'GET',
      { timeout: 120_000 },
    );
    const saveButton = this.page
      .locator('.outletBox2')
      .getByRole('button', { name: /save & proceed/i })
      .first();
    await expect(saveButton).toBeEnabled({ timeout: 30_000 });
    await saveButton.click();
    await saveResponse.catch(() => null);
    await this.waitForStep('review-summary');
  }

  async verifyReviewSummary(data: CreateApplicationFormData): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /review summary/i })).toBeVisible({
      timeout: 60_000,
    });
    await expect(this.page.getByText(data.surname, { exact: false }).first()).toBeVisible();

    const initialContributionValue = this.page
      .getByText('Initial Contribution', { exact: true })
      .locator('..')
      .getByRole('paragraph')
      .last();
    await expect(initialContributionValue).toHaveText(amountDisplayPattern(data.initialAmount));
  }

  async proceedReviewToUpload(): Promise<void> {
    const saveButton = this.page
      .locator('.outletBox2')
      .getByRole('button', { name: /save & proceed/i })
      .first();
    await saveButton.click();

    const confirmDialog = this.page.getByRole('dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 15_000 });
    await confirmDialog.getByRole('button', { name: /^confirm$/i }).click();
    await this.waitForStep('upload-signed-copy');
  }

  /** Saves unsigned application PDF from portal download API (optional debug artifact). */
  async downloadUnsignedApplicationPdf(saveDir?: string): Promise<string | null> {
    const downloadButton = this.page
      .locator('.outletBox2')
      .getByRole('button')
      .filter({ has: this.page.locator('img[alt="download"]') })
      .first();

    if (!(await downloadButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return null;
    }

    const dir =
      saveDir ??
      path.join(getRepoRoot(), 'test-results', 'create-application', this.getApplicationId());
    fs.mkdirSync(dir, { recursive: true });

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 120_000 }),
      downloadButton.click(),
    ]);

    const filename = download.suggestedFilename() || `application-${this.getApplicationId()}.pdf`;
    const target = path.join(dir, filename);
    await download.saveAs(target);
    return target;
  }

  /** Wait for upload page metadata (Qld flag, POA count, existing files). */
  async waitForUploadStepReady(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /upload documents/i })).toBeVisible({
      timeout: 60_000,
    });
    await this.page
      .waitForResponse(
        (r) => r.url().includes('/owner/poa-count/') && r.request().method() === 'GET',
        { timeout: 60_000 },
      )
      .catch(() => null);
  }

  /** Same as portal handleBoxClick — programmatic click on hidden input opens file chooser. */
  private async chooseFileThroughInput(inputSelector: string, filePath: string): Promise<void> {
    const input = this.page.locator(inputSelector);
    await expect(input).toBeAttached({ timeout: 30_000 });

    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      input.evaluate((el) => {
        (el as HTMLInputElement).click();
      }),
    ]);
    await fileChooser.setFiles(filePath);
  }

  private async isQueenslandDocumentUploaded(pdfName: string): Promise<boolean> {
    const uploadButton = this.page.getByRole('button', { name: /upload queensland document/i });
    if (!(await uploadButton.isVisible().catch(() => false))) {
      return true;
    }
    return this.page.getByText(pdfName, { exact: false }).first().isVisible().catch(() => false);
  }

  /** Qld residents must upload Client Care Statement before Submit is enabled. */
  async uploadQueenslandDocumentIfNeeded(queenslandPdfPath: string): Promise<void> {
    await this.waitForUploadStepReady();

    const needsQueensland =
      (await this.page.getByRole('button', { name: /upload queensland document/i }).isVisible().catch(() => false)) ||
      (await this.page.locator('#queenslandDocumentCheckbox').isVisible().catch(() => false));

    if (!needsQueensland) {
      return;
    }

    const pdfName = path.basename(queenslandPdfPath);
    if (await this.isQueenslandDocumentUploaded(pdfName)) {
      return;
    }

    await this.chooseFileThroughInput('#file-input-QueenslandDocument', queenslandPdfPath);

    await expect(this.page.getByRole('button', { name: /upload queensland document/i })).toBeHidden({
      timeout: 60_000,
    });
    await expect(this.page.getByText(pdfName, { exact: false }).first()).toBeVisible({ timeout: 60_000 });
  }

  async confirmUploadCheckboxes(): Promise<void> {
    const applicationCheckbox = this.page.locator('#applicationCheckbox');
    if (await applicationCheckbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await applicationCheckbox.check();
      await expect(applicationCheckbox).toBeChecked();
    }

    const nominationCheckbox = this.page.locator('#nominationCheckbox');
    if (await nominationCheckbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nominationCheckbox.check();
      await expect(nominationCheckbox).toBeChecked();
    }

    const queenslandCheckbox = this.page.locator('#queenslandDocumentCheckbox');
    if (await queenslandCheckbox.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await queenslandCheckbox.check();
      await expect(queenslandCheckbox).toBeChecked();
    }
  }

  /**
   * Portal removes `#file-input-signed` after the first upload (uploadSignedCopy.tsx).
   * Matrix workflow uploads in "Upload Documents" then submits in "Submit Application".
   */
  async uploadSignedApplicationIfNeeded(signedPdfPath: string): Promise<void> {
    await this.waitForUploadStepReady();

    const pdfName = path.basename(signedPdfPath);
    const uploadedFile = this.page.getByText(pdfName, { exact: false }).first();

    if (await uploadedFile.isVisible().catch(() => false)) {
      return;
    }

    const uploadButton = this.page.getByRole('button', { name: /upload signed application/i });
    if (!(await uploadButton.isVisible({ timeout: 5_000 }).catch(() => false))) {
      throw new Error('Signed application upload control not found on upload step.');
    }

    await this.chooseFileThroughInput('#file-input-signed', signedPdfPath);

    await expect(uploadedFile).toBeVisible({ timeout: 60_000 });
  }

  async uploadSignAndSubmit(
    signedPdfPath: string,
    queenslandPdfPath?: string,
  ): Promise<ApplicationSubmissionResult> {
    await this.waitForUploadStepReady();

    const applicationId = this.getApplicationId();
    const initiateButton = this.page.getByRole('button', { name: /initiate digital signature/i });
    if (await initiateButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(initiateButton).toBeDisabled();
    }

    await this.uploadSignedApplicationIfNeeded(signedPdfPath);
    if (queenslandPdfPath) {
      await this.uploadQueenslandDocumentIfNeeded(queenslandPdfPath);
    }
    await this.confirmUploadCheckboxes();

    const submitButton = this.page.getByRole('button', { name: /submit application/i });
    await expect(submitButton).toBeEnabled({ timeout: 120_000 });

    const uploadResponse = this.page.waitForResponse(
      (r) => r.url().includes('/files/upload') && r.request().method() === 'POST',
      { timeout: 180_000 },
    );
    const statusResponse = this.page.waitForResponse(
      (r) => r.url().includes('/application/update-status') && r.request().method() === 'PUT',
      { timeout: 180_000 },
    );

    await submitButton.click();

    const reviewDialog = this.page.getByRole('dialog');
    await expect(reviewDialog).toBeVisible({ timeout: 15_000 });
    await reviewDialog.getByRole('button', { name: /^confirm$/i }).click();

    const upload = await uploadResponse.catch(() => null);
    const status = await statusResponse.catch(() => null);
    if (status && !status.ok()) {
      const body = await status.text().catch(() => '');
      throw new Error(`Application submit failed (${status.status()}): ${body.slice(0, 500)}`);
    }

    let statusBody: { status?: string; displayId?: string } | null = null;
    if (status) {
      statusBody = (await status.json().catch(() => null)) as {
        status?: string;
        displayId?: string;
      } | null;
    }

    const okDialog = this.page.getByRole('dialog');
    if (await okDialog.isVisible({ timeout: 30_000 }).catch(() => false)) {
      const okButton = okDialog.getByRole('button', { name: /^ok$/i });
      if (await okButton.isVisible().catch(() => false)) {
        await okButton.click();
      }
    }

    await expect(this.page).toHaveURL(
      new RegExp(`${this.routePrefix()}/application(?:/|$)`, 'i'),
      { timeout: 120_000 },
    );

    expect(statusBody?.status, 'POST submit should set application status').toBeTruthy();

    return {
      applicationId,
      status: statusBody?.status,
      displayId: statusBody?.displayId,
      fileUploadOk: upload?.ok() ?? false,
      statusUpdateOk: status?.ok() ?? false,
    };
  }

  async completeWizardFromExcel(
    data: CreateApplicationFormData,
    signedPdfPath: string,
    options?: { saveUnsignedPdf?: boolean },
  ): Promise<ApplicationSubmissionResult> {
    await this.waitForStep('investor-details');
    await this.fillInvestorDetails(data);
    await this.saveAndProceedInvestorDetails();

    await this.fillInvestmentAmount(data);
    await this.saveAndProceedInvestmentAmount(data.initialAmount);
    await this.fillAllocationIfShown(data.initialAmount);

    await this.fillPaymentDetails(data);
    await this.saveAndProceedPaymentDetails();

    await this.acceptDeclarations();
    await this.verifyReviewSummary(data);
    await this.proceedReviewToUpload();

    if (options?.saveUnsignedPdf) {
      await this.downloadUnsignedApplicationPdf().catch(() => null);
    }

    return this.uploadSignAndSubmit(signedPdfPath);
  }
}
