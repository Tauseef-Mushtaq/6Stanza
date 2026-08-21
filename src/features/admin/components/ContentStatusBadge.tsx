import { Badge } from "@/components/ui/Badge";
import type { ContentStatus } from "@/lib/supabase/database.types";

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const STATUS_TONE: Record<ContentStatus, "brand" | "success" | "neutral"> = {
  draft: "brand",
  published: "success",
  archived: "neutral",
};

/**
 * Module 9B — `content_status` counterpart to `StatusBadge.tsx`
 * (which is typed to `InquiryStatus`). Kept as its own component
 * rather than widening `StatusBadge` to accept either enum, since the
 * two status systems are unrelated and a shared component would need
 * a discriminant prop for no real benefit.
 */
export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant="status" tone={STATUS_TONE[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
