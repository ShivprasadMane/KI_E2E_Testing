import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';

export const FUNERAL_VIDEO_BUTTONS = [
  'Navigating KeyInvest Portal Dashboard',
  'Creating New Application in KeyInvest Portal',
  'Making Claim in KeyInvest Portal',
] as const;

export const ADVISER_VIDEO_BUTTONS = [
  'KeyInvest Funeral Bond Application Guide',
  'KeyInvest Life Events Bond Application Guide',
  'How to Lodge a Claim on KeyInvest Adviser Portal',
] as const;

export class DashboardVideosPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  private videoButtons(): readonly string[] {
    if (this.persona === 'funeral') return FUNERAL_VIDEO_BUTTONS;
    if (this.persona === 'adviser') return ADVISER_VIDEO_BUTTONS;
    return [];
  }

  async verifyAllVideosOpen(): Promise<void> {
    const buttons = this.videoButtons();
    if (!buttons.length) {
      throw new Error(`Dashboard videos are not shown for persona: ${this.persona}`);
    }

    for (const label of buttons) {
      const button = this.page.getByRole('button', { name: label });
      await expect(button).toBeVisible();

      const [popup] = await Promise.all([
        this.page.context().waitForEvent('page'),
        button.click(),
      ]);

      expect(popup.url()).not.toBe(this.page.url());
      await popup.close();
    }
  }
}
