import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';

export type ExportFormat = 'excel' | 'pdf';

export type DashboardExportSection = {
  buttonTitle: string;
  excelFile: RegExp;
  pdfFile: RegExp;
  /** Wait for this API path after click (adviser widgets fetch all rows before opening dialog). */
  waitForApi?: string;
};

export type VerifyAllSectionExportsOptions = {
  /** Defaults to excel + pdf. Matrix runs use excel only — PDF can hang on large adviser widgets in headed mode. */
  formats?: readonly ExportFormat[];
};

const SHARED_EXPORT_SECTIONS: readonly Omit<DashboardExportSection, 'buttonTitle'>[] = [
  {
    excelFile: /^client_age_distribution(_\w+)?\.xlsx$/i,
    pdfFile: /^client_age_distribution(_\w+)?\.pdf$/i,
  },
  {
    excelFile: /^recent_applications\.xlsx$/i,
    pdfFile: /^recent_applications\.pdf$/i,
  },
  {
    excelFile: /^recent_claims\.xlsx$/i,
    pdfFile: /^recent_claims\.pdf$/i,
  },
  {
    excelFile: /^applications_summary(_[\d-]+(?:_to_[\d-]+)?|_from_[\d-]+)?\.xlsx$/i,
    pdfFile: /^applications_summary(_[\d-]+(?:_to_[\d-]+)?|_from_[\d-]+)?\.pdf$/i,
  },
];

const CLAIMS_SUMMARY_SECTION: DashboardExportSection = {
  buttonTitle: 'Export Claims Summary',
  excelFile: /^claims_summary\.xlsx$/i,
  pdfFile: /^claims_summary\.pdf$/i,
};

const ADVISER_ONLY_EXPORT_SECTIONS: readonly DashboardExportSection[] = [
  {
    buttonTitle: 'Export Funeral Bond Allowable Contributions',
    excelFile: /^allowable_contributions\.xlsx$/i,
    pdfFile: /^allowable_contributions\.pdf$/i,
    waitForApi: '/owner/FBpolicies/',
  },
  {
    buttonTitle: 'Export Approaching Anniversary Dates',
    excelFile: /^upcoming_anniversary\.xlsx$/i,
    pdfFile: /^upcoming_anniversary\.pdf$/i,
    waitForApi: '/owner/policiesByAnnv/',
  },
  {
    buttonTitle: 'Export Adviser Fees and Client Consent End Date',
    excelFile: /^adviser_fees_client_consent\.xlsx$/i,
    pdfFile: /^adviser_fees_client_consent\.pdf$/i,
    waitForApi: '/owner/advisorfee/',
  },
];

/** Export sections per persona — funeral NFDA dashboard vs financial adviser dashboard. */
export function getDashboardExportSections(persona: Persona): readonly DashboardExportSection[] {
  const portfolioButton =
    persona === 'funeral' ? 'Print Portfolio Summary' : 'Export Portfolio Summary';

  const sections: DashboardExportSection[] = [
    {
      buttonTitle: portfolioButton,
      excelFile: /^portfolio_summary\.xlsx$/i,
      pdfFile: /^portfolio_summary\.pdf$/i,
    },
    {
      buttonTitle: 'Export Client Age Distribution',
      ...SHARED_EXPORT_SECTIONS[0],
    },
    {
      buttonTitle: 'Export Recent Applications',
      ...SHARED_EXPORT_SECTIONS[1],
    },
    {
      buttonTitle: 'Export Recent Claims',
      ...SHARED_EXPORT_SECTIONS[2],
    },
    {
      buttonTitle: 'Export Applications Summary',
      ...SHARED_EXPORT_SECTIONS[3],
    },
  ];

  if (persona === 'funeral') {
    sections.push(CLAIMS_SUMMARY_SECTION);
  }

  if (persona === 'adviser') {
    sections.push(...ADVISER_ONLY_EXPORT_SECTIONS);
  }

  return sections;
}

/** @deprecated Use getDashboardExportSections(persona) — funeral defaults for legacy specs. */
export const DASHBOARD_EXPORT_SECTIONS = getDashboardExportSections('funeral');

export class DashboardExportPage {
  private readonly sections: readonly DashboardExportSection[];

  constructor(
    private readonly page: Page,
    persona: Persona = 'funeral',
  ) {
    this.sections = getDashboardExportSections(persona);
  }

  exportButton(title: string) {
    return this.page.getByRole('button', { name: title });
  }

  private exportDialog() {
    return this.page.getByRole('dialog').filter({ hasText: 'Export Report' });
  }

  /** Close any export dialog left open from a prior step (common after headed popup / export runs). */
  private async dismissStaleDialogs(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const dialog = this.exportDialog();
      if (!(await dialog.isVisible().catch(() => false))) {
        return;
      }

      const closeButton = dialog.getByRole('button').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click().catch(() => {});
      }

      await this.page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    }
  }

  async assertAllExportButtonsVisible(): Promise<void> {
    for (const { buttonTitle } of this.sections) {
      const button = this.exportButton(buttonTitle);
      await button.scrollIntoViewIfNeeded();
      await expect(button).toBeVisible();
    }
  }

  async openExportDialog(section: DashboardExportSection): Promise<void> {
    await this.dismissStaleDialogs();

    const button = this.exportButton(section.buttonTitle);
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible({ timeout: 30_000 });

    if (section.waitForApi) {
      await Promise.all([
        this.page.waitForResponse(
          (res) => res.url().includes(section.waitForApi!) && res.ok(),
          { timeout: 90_000 },
        ),
        button.click(),
      ]);
    } else {
      await button.click();
    }

    const dialog = this.exportDialog();
    await expect(dialog).toBeVisible({ timeout: 60_000 });
    await expect(dialog.getByText('Export Report')).toBeVisible();
    await expect(dialog.getByRole('radio', { name: /Excel/i })).toBeVisible();
    await expect(dialog.getByRole('radio', { name: /PDF/i })).toBeVisible();
  }

  async exportSection(section: DashboardExportSection, format: ExportFormat): Promise<string> {
    try {
      await this.openExportDialog(section);

      const dialog = this.exportDialog();
      const radioLabel = format === 'excel' ? /Excel/i : /PDF/i;
      await dialog.getByRole('radio', { name: radioLabel }).check();

      const exportButton = dialog.getByRole('button', { name: 'Export', exact: true });
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();

      const downloadTimeout = format === 'pdf' ? 120_000 : 90_000;
      const [download] = await Promise.all([
        this.page.context().waitForEvent('download', { timeout: downloadTimeout }),
        exportButton.click(),
      ]);

      const filename = download.suggestedFilename();
      const pattern = format === 'excel' ? section.excelFile : section.pdfFile;
      expect(filename, `Unexpected filename for "${section.buttonTitle}" (${format})`).toMatch(pattern);

      const filePath = await download.path();
      if (filePath) {
        const fs = await import('fs');
        expect(fs.statSync(filePath).size).toBeGreaterThan(0);
      }

      await expect(this.exportDialog()).toBeHidden({ timeout: 15_000 });
      return filename;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`"${section.buttonTitle}" (${format}): ${message}`);
    }
  }

  /** Export every dashboard widget. Matrix uses excel-only; dedicated specs cover PDF. */
  async verifyAllSectionExports(options?: VerifyAllSectionExportsOptions): Promise<void> {
    const formats = options?.formats ?? (['excel', 'pdf'] as const);
    await this.assertAllExportButtonsVisible();

    for (const section of this.sections) {
      for (const format of formats) {
        await this.exportSection(section, format);
      }
    }
  }
}
