export type ApplicationSubmissionResult = {
  applicationId: string;
  status?: string;
  displayId?: string;
  fileUploadOk: boolean;
  statusUpdateOk: boolean;
};

/**
 * Backend queues APPROVED client emails after ~3 minutes (180s).
 * PREPAID funeral bonds set mailSendToClientCCAdvisor=false — approval email goes to
 * funeral director / adviser, not the applicant email on investor details.
 */
export const APPROVED_EMAIL_DELAY_MS = 180_000;
