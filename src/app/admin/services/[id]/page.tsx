import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { getServiceForAdmin } from "@/lib/services/serviceContentService";
import { ServiceForm } from "@/features/admin/components/ServiceForm";
import { ArchiveServiceButton } from "@/features/admin/components/ArchiveServiceButton";
import { DeleteServiceButton } from "@/features/admin/components/DeleteServiceButton";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";

export const metadata: Metadata = { title: "Edit Service" };

/**
 * Module 9B — `/admin/services/[id]` (spec §12). Fetches through
 * `getServiceForAdmin` (`lib/services/serviceContentService.ts`),
 * itself `requireAdmin()`-gated and RLS-backed — same shape as the
 * existing `ContactInquiryDetailPage`. Handles a genuinely missing
 * or invalid id with `notFound()` rather than crashing into the
 * generic error boundary.
 */
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getServiceForAdmin(id);

  if (!result.ok) {
    return (
      <div role="alert" className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
        {result.message}
      </div>
    );
  }

  const service = result.data;
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/services"
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Services
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Edit Service</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            {service.name}
          </h1>
          <div className="flex items-center gap-3">
            <ContentStatusBadge status={service.status} />
            <ArchiveServiceButton id={service.id} alreadyArchived={service.status === "archived"} />
            <DeleteServiceButton id={service.id} />
          </div>
        </div>
      </div>

      <ServiceForm service={service} />
    </div>
  );
}
