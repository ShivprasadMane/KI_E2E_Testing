import { expect, type Page } from '@playwright/test';
import type { Persona } from '../framework/data/matrix.types';

export class NewsUpdatesPage {
  constructor(
    private readonly page: Page,
    private readonly persona: Persona,
  ) {}

  async verifyNewsWidget(): Promise<void> {
    if (this.persona === 'investor') {
      await expect(this.page.getByText('Applications Listing', { exact: true })).toBeVisible();
      return;
    }

    if (this.persona !== 'funeral' && this.persona !== 'adviser') {
      throw new Error(`News and Updates widget is not applicable for persona: ${this.persona}`);
    }

    const newsContainer =
      this.persona === 'adviser'
        ? // Adviser: News banner is top-right, above Approaching Anniversary (not below Recent Claims).
          this.page
            .getByText('Approaching Anniversary Dates - Life Events Bond', { exact: true })
            .locator(
              'xpath=ancestor::div[contains(@class,"MuiGrid-root")][1]/preceding-sibling::div[1]',
            )
        : // Funeral: News is in the right column below Recent Claims.
          this.page
            .getByText('Recent Claims', { exact: true })
            .locator(
              'xpath=ancestor::div[contains(@class,"MuiGrid-root")][1]/following::div[contains(@class,"MuiGrid-root")][1]',
            );

    await expect(newsContainer).toBeVisible();

    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'),
      newsContainer.click({ position: { x: 40, y: 40 } }),
    ]);

    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toMatch(/keyinvest\.com\.au\/news/i);
    await popup.close();
  }
}
