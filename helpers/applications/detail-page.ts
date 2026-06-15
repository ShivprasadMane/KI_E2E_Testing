import type { Page } from '@playwright/test';

/** Application view pages use different titles depending on product / submission type. */
export const APPLICATION_DETAIL_HEADING =
  /Application (Details|Form)|Additional Contribution Details|Funeral Bond Application/i;

export function applicationDetailHeading(page: Page) {
  return page.getByText(APPLICATION_DETAIL_HEADING).first();
}
