import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';

export type ExportFormat = 'excel' | 'pdf';

export type DashboardExportSection = {
  buttonTitle: string;
  excelFile: RegExp;
  pdfFile: RegExp;
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

  async assertAllExportButtonsVisible(): Promise<void> {
    for (const { buttonTitle } of this.sections) {
      await expect(this.exportButton(buttonTitle)).toBeVisible();
    }
  }

  async openExportDialog(section: DashboardExportSection): Promise<void> {
    await this.exportButton(section.buttonTitle).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Export Report')).toBeVisible();
    await expect(this.page.getByRole('radio', { name: /Excel/i })).toBeVisible();
    await expect(this.page.getByRole('radio', { name: /PDF/i })).toBeVisible();
  }

  async exportSection(section: DashboardExportSection, format: ExportFormat): Promise<string> {
    await this.openExportDialog(section);

    const radioLabel = format === 'excel' ? /Excel/i : /PDF/i;
    await this.page.getByRole('radio', { name: radioLabel }).check();

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 60_000 }),
      this.page.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    const filename = download.suggestedFilename();
    const pattern = format === 'excel' ? section.excelFile : section.pdfFile;
    expect(filename).toMatch(pattern);

    const filePath = await download.path();
    if (filePath) {
      const fs = await import('fs');
      expect(fs.statSync(filePath).size).toBeGreaterThan(0);
    }

    await expect(this.page.getByRole('dialog')).toBeHidden({ timeout: 15_000 });
    return filename;
  }

  /** Excel + PDF export for every dashboard widget on this persona's dashboard. */
  async verifyAllSectionExports(): Promise<void> {
    await this.assertAllExportButtonsVisible();
    for (const section of this.sections) {
      await this.exportSection(section, 'excel');
      await this.exportSection(section, 'pdf');
    }
  }
}
