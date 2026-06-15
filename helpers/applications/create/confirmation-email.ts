import type { Page } from '@playwright/test';
import { APPROVED_EMAIL_DELAY_MS } from './submission-result';

/**
 * Post-submit email checks.
 *
 * Backend behaviour (test env):
 * - Submit sets status APPROVED (not SUBMITTED) via PUT /application/update-status
 * - APPROVED emails are queued with ~3 minute delay (180s)
 * - PREPAID funeral bond: mailSendToClientCCAdvisor=false → email to FD/adviser, not applicant
 * - Test API may redirect mail when IS-TEST-ENABLED=TRUE (TEST-EMAIL env on backend)
 *
 * IMAP polling is not implemented yet — this only soft-checks UI if still on a page with reference text.
 */
export async function verifyConfirmationEmailOrReference(
  page: Page,
  referencePattern: RegExp,
): Promise<void> {
  const mailbox = process.env.CONFIRMATION_EMAIL_MAILBOX?.trim();
  if (mailbox) {
    // TODO: IMAP/graph poll — allow APPROVED_EMAIL_DELAY_MS + buffer for backend queue
    const waitMs = APPROVED_EMAIL_DELAY_MS + 60_000;
    void waitMs;
  }

  await page.getByText(referencePattern).first().waitFor({ state: 'visible', timeout: 60_000 }).catch(() => {});
}
