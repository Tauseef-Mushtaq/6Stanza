import "server-only";

import { services as serviceCatalog } from "@/features/home/data/services";
import type { ProjectInquiryRow } from "@/lib/repositories/projectInquiries";

/** Slug → human label, sourced from the same canonical list the form/validation use — no duplicated copy to drift. */
function serviceLabels(slugs: string[]): string[] {
  const bySlug = new Map(serviceCatalog.map((s) => [s.slug, s.label]));
  return slugs.map((slug) => bySlug.get(slug) ?? slug);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function adminInquiryUrl(id: string): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  return `${siteUrl.replace(/\/$/, "")}/admin/inquiries/project/${id}`;
}

/**
 * Company notification — sent to `INQUIRY_NOTIFICATION_EMAIL`. Internal
 * content only reachable via the admin dashboard is fine here; this email
 * never goes to the client.
 *
 * Discovery/consultation/attachment fields are included defensively should
 * `project_inquiries` ever gain those columns — today the schema
 * (`supabase/migrations/0003_project_inquiries.sql`) has none of them, so
 * those sections simply don't render (see MODULE-INQUIRY-EMAIL-HANDOFF.md).
 */
export function renderAdminInquiryEmail(row: ProjectInquiryRow): { subject: string; html: string; text: string } {
  const subject = `New project inquiry: ${row.project_title} (${row.name})`;
  const services = serviceLabels(row.services).join(", ") || "—";
  const link = adminInquiryUrl(row.id);

  const rows: Array<[string, string]> = [
    ["Inquiry ID", row.id],
    ["Submitted", formatDate(row.created_at)],
    ["Name", row.name],
    ["Email", row.email],
    ["Company", row.company || "—"],
    ["Project title", row.project_title],
    ["Services", services],
    ["Stage", row.stage || "—"],
    ["Timeline", row.timeline || "—"],
    ["Budget", row.budget || "—"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5b6472;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(
          label
        )}</td><td style="padding:6px 0;color:#101418;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const rowsText = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;color:#101418;">
      <h2 style="margin:0 0 4px;">New project inquiry</h2>
      <p style="margin:0 0 20px;color:#5b6472;">A new inquiry was just saved to project_inquiries.</p>
      <table role="presentation" style="border-collapse:collapse;width:100%;margin-bottom:20px;">${rowsHtml}</table>
      <div style="margin:0 0 20px;">
        <div style="font-weight:600;color:#5b6472;margin-bottom:4px;">Project description</div>
        <div style="white-space:pre-wrap;background:#f5f6f8;border-radius:8px;padding:12px 14px;">${escapeHtml(
          row.message
        )}</div>
      </div>
      ${
        link
          ? `<a href="${link}" style="display:inline-block;background:#101418;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600;">View in admin</a>`
          : ""
      }
    </div>
  `.trim();

  const text = [
    "New project inquiry",
    "",
    rowsText,
    "",
    "Project description:",
    row.message,
    "",
    link ? `View in admin: ${link}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/**
 * Client confirmation — sent to the visitor's submitted email. Intentionally
 * excludes anything internal (no admin link, no status field, no raw
 * inquiry-management metadata) — only what the person who submitted the
 * form should see about their own submission.
 */
export function renderClientConfirmationEmail(row: ProjectInquiryRow): { subject: string; html: string; text: string } {
  const subject = "We received your project inquiry — 6STANZA";
  const shortId = row.id.slice(0, 8);

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#101418;">
      <h2 style="margin:0 0 4px;">Thanks, ${escapeHtml(row.name.split(" ")[0] || row.name)} — we've got it.</h2>
      <p style="color:#5b6472;">Your project inquiry for <strong>${escapeHtml(
        row.project_title
      )}</strong> has been received.</p>
      <p style="color:#5b6472;">Reference ID: <code>${escapeHtml(shortId)}</code></p>
      <p style="color:#5b6472;">A member of the 6STANZA team will review the details and follow up at this email address, typically within 1–2 business days. If you'd like to speak sooner, you're welcome to book a consultation directly from our site.</p>
      <p style="margin-top:24px;color:#8a919c;font-size:13px;">— 6STANZA</p>
    </div>
  `.trim();

  const text = [
    `Thanks, ${row.name.split(" ")[0] || row.name} — we've got it.`,
    "",
    `Your project inquiry for "${row.project_title}" has been received.`,
    `Reference ID: ${shortId}`,
    "",
    "A member of the 6STANZA team will review the details and follow up at this email address, typically within 1–2 business days. If you'd like to speak sooner, you're welcome to book a consultation directly from our site.",
    "",
    "— 6STANZA",
  ].join("\n");

  return { subject, html, text };
}
