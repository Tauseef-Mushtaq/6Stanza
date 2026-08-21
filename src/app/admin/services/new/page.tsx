import type { Metadata } from "next";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { ServiceForm } from "@/features/admin/components/ServiceForm";

export const metadata: Metadata = { title: "New Service" };

/** Module 9B — `/admin/services/new` (spec §7). Renders `ServiceForm` with no `service` prop, i.e. create mode. */
export default function NewServicePage() {
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
          <TechnicalLabel>New Service</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Create Service
        </h1>
      </div>

      <ServiceForm />
    </div>
  );
}
