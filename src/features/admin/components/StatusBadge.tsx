import { Badge } from "@/components/ui/Badge";
import type { InquiryStatus } from "@/lib/supabase/database.types";

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  archived: "Archived",
};

const STATUS_TONE: Record<InquiryStatus, "brand" | "warning" | "success" | "neutral"> = {
  new: "brand",
  in_progress: "warning",
  resolved: "success",
  archived: "neutral",
};

/** Reuses the existing `Badge` primitive (`components/ui/Badge.tsx`) rather than introducing a second status-chip component. */
export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge variant="status" tone={STATUS_TONE[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
