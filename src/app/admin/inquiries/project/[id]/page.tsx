import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Card, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getProjectInquiryForAdmin } from "@/lib/services/projectInquiryService";
import { StatusSelect } from "@/features/admin/components/StatusSelect";

export const metadata: Metadata = { title: "Project Inquiry" };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Module 7A — project inquiry detail (spec §9). Preserves the
 * structured fields (services as individual badges, stage/timeline/
 * budget as their own rows) rather than flattening them into a single
 * text blob, per spec §9's "preserve structured fields instead of
 * flattening them unnecessarily."
 */
export default async function ProjectInquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: statusFromList } = await searchParams;
  const backHref = statusFromList ? `/admin/inquiries?status=${statusFromList}` : "/admin/inquiries";
  const result = await getProjectInquiryForAdmin(id);

  if (!result.ok) {
    return (
      <div role="alert" className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
        {result.message}
      </div>
    );
  }

  const inquiry = result.data;
  if (!inquiry) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href={backHref}
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Inquiries
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Project Inquiry</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          {inquiry.project_title}
        </h1>
      </div>

      <Card variant="bordered" className="gap-6">
        <dl className="flex flex-col gap-4">
          <Row label="Name" value={inquiry.name} />
          <Row label="Email" value={inquiry.email} />
          <Row label="Company" value={inquiry.company ?? "—"} />
          <Row label="Stage" value={inquiry.stage ?? "—"} />
          <Row label="Timeline" value={inquiry.timeline ?? "—"} />
          <Row label="Budget" value={inquiry.budget ?? "—"} />
          <Row label="Created" value={formatDateTime(inquiry.created_at)} />
          <Row label="Updated" value={formatDateTime(inquiry.updated_at)} />
        </dl>

        <div className="flex flex-col gap-2">
          <span className="font-[var(--font-mono)] uppercase" style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}>
            Services
          </span>
          <div className="flex flex-wrap gap-2">
            {inquiry.services.map((service) => (
              <Badge key={service} variant="outline" tone="brand">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-[var(--font-mono)] uppercase" style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}>
            Message
          </span>
          <CardDescription className="whitespace-pre-wrap">{inquiry.message}</CardDescription>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-[var(--font-mono)] uppercase" style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}>
            Status
          </span>
          <StatusSelect type="project" id={inquiry.id} initialStatus={inquiry.status} />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3" style={{ borderColor: "var(--color-border)" }}>
      <dt style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-small)" }}>{label}</dt>
      <dd className="break-words sm:text-right" style={{ fontSize: "var(--text-small)" }}>{value}</dd>
    </div>
  );
}
