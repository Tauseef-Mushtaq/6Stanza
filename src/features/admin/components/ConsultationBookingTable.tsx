import Link from "next/link";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import type { ConsultationBookingRow } from "@/lib/repositories/consultationBookings";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Module Consultation Booking 2 — empty state, same distinction
 * `InquiryTable.tsx`'s `EmptyState` makes: "nothing has ever come in"
 * vs. "nothing matches the current filter".
 */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-10 text-center"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      {filtered ? "No bookings match this status." : "No consultation bookings yet."}
    </div>
  );
}

/**
 * Module Consultation Booking 2 — the admin booking list. Same
 * responsive pattern as `InquiryTable.tsx`: stacked cards below `md`,
 * a table at `md` and above. Shows a fixed, minimal column set
 * (Client/Email/Consultation Time/Status/Created) — the complete
 * record (Cal.com reference, event type, related inquiry) is one
 * click away in the detail view. `statusQuery` (the current
 * `?status=...`, or `""` for "all") is appended to each detail link so
 * returning from a detail page preserves the active filter.
 */
export function ConsultationBookingTable({
  items,
  filtered,
  statusQuery,
}: {
  items: ConsultationBookingRow[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (items.length === 0) {
    return <EmptyState filtered={filtered} />;
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/consultation-bookings/${item.id}${statusQuery}`}
              className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors hover:bg-[var(--color-surface)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate" style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>
                    {item.attendee_name}
                  </span>
                  <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                    {item.attendee_email}
                  </span>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                {formatDateTime(item.starts_at)}
              </span>

              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                  {item.event_type_slug}
                </span>
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                  {formatDate(item.created_at)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Client", "Email", "Consultation", "Status", "Created"].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/consultation-bookings/${item.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {item.attendee_name}
                  </Link>
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {item.attendee_email}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDateTime(item.starts_at)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(item.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
