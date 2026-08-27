import "server-only";

import { getResendClient, getEmailFromAddress, getInquiryNotificationEmail } from "./resendClient";
import { renderAdminInquiryEmail, renderClientConfirmationEmail } from "./inquiryEmailTemplates";
import type { ProjectInquiryRow } from "@/lib/repositories/projectInquiries";

export type NotificationOutcome = {
  attempted: boolean;
  adminSent: boolean;
  clientSent: boolean;
  /** Non-secret reasons, safe to log or surface in admin tooling — never provider error bodies/keys. */
  errors: string[];
};

/**
 * Process-local dedupe guard, keyed by inquiry id. Covers the common
 * "accidental duplicate submission" case within a single warm server
 * instance (e.g. an aggressive form re-submit, a retried Server Action
 * invocation) without a new database table (spec constraint: don't add
 * another inquiry table/path).
 *
 * This is a best-effort guard, not a strong guarantee: serverless
 * deployments can spin up multiple instances with independent memory, and
 * this cache is not shared across them or persisted across cold starts. A
 * durable guarantee would need a unique constraint or a
 * `notified_at`-style column on `project_inquiries` itself, which is
 * out of scope here (see MODULE-INQUIRY-EMAIL-HANDOFF.md). Capped and
 * self-evicting so it can't grow unbounded on a long-lived instance.
 */
const MAX_TRACKED = 500;
const sentForInquiryId = new Set<string>();

function markAndCheckDuplicate(id: string): boolean {
  if (sentForInquiryId.has(id)) return true;
  if (sentForInquiryId.size >= MAX_TRACKED) {
    const oldest = sentForInquiryId.values().next().value;
    if (oldest !== undefined) sentForInquiryId.delete(oldest);
  }
  sentForInquiryId.add(id);
  return false;
}

/**
 * Fires the two inquiry emails (business notification + client
 * confirmation) for a just-saved `project_inquiries` row.
 *
 * Called only after `insertProjectInquiry` has already succeeded
 * (`projectInquiryService.ts`) — never the other way around. Every failure
 * path here is caught and turned into a logged, non-throwing outcome: a
 * missing/misconfigured Resend setup, a provider error, or an unexpected
 * exception all result in `{ attempted: ..., errors: [...] }`, never a
 * thrown error, so a saved inquiry can never be reported as failed just
 * because email delivery had a problem.
 */
export async function sendProjectInquiryNotifications(row: ProjectInquiryRow): Promise<NotificationOutcome> {
  const outcome: NotificationOutcome = { attempted: false, adminSent: false, clientSent: false, errors: [] };

  if (markAndCheckDuplicate(row.id)) {
    outcome.errors.push("skipped: notifications already attempted for this inquiry id");
    return outcome;
  }

  const resend = getResendClient();
  const from = getEmailFromAddress();
  const notifyEmail = getInquiryNotificationEmail();

  if (!resend || !from) {
    outcome.errors.push("skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured");
    console.warn("sendProjectInquiryNotifications: Resend is not configured — skipping email notifications", {
      inquiryId: row.id,
    });
    return outcome;
  }

  outcome.attempted = true;

  // Company notification — only if a recipient inbox is configured.
  if (notifyEmail) {
    try {
      const { subject, html, text } = renderAdminInquiryEmail(row);
      const { error } = await resend.emails.send({ from, to: notifyEmail, subject, html, text });
      if (error) {
        outcome.errors.push(`admin email failed: ${error.name ?? "provider error"}`);
        console.error("sendProjectInquiryNotifications: admin email failed", {
          inquiryId: row.id,
          errorName: error.name,
        });
      } else {
        outcome.adminSent = true;
      }
    } catch (err) {
      outcome.errors.push("admin email failed: unexpected error");
      console.error("sendProjectInquiryNotifications: admin email threw", { inquiryId: row.id, err });
    }
  } else {
    outcome.errors.push("skipped admin email: INQUIRY_NOTIFICATION_EMAIL is not configured");
    console.warn("sendProjectInquiryNotifications: INQUIRY_NOTIFICATION_EMAIL is not configured — skipping admin email", {
      inquiryId: row.id,
    });
  }

  // Client confirmation — best-effort, independent of whether the admin email succeeded.
  try {
    const { subject, html, text } = renderClientConfirmationEmail(row);
    const { error } = await resend.emails.send({ from, to: row.email, subject, html, text });
    if (error) {
      outcome.errors.push(`client email failed: ${error.name ?? "provider error"}`);
      console.error("sendProjectInquiryNotifications: client email failed", {
        inquiryId: row.id,
        errorName: error.name,
      });
    } else {
      outcome.clientSent = true;
    }
  } catch (err) {
    outcome.errors.push("client email failed: unexpected error");
    console.error("sendProjectInquiryNotifications: client email threw", { inquiryId: row.id, err });
  }

  return outcome;
}
