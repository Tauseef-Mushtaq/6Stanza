"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/form/Field";
import { ErrorText } from "@/components/ui/form/Field";
import { updateInquiryStatusAction } from "@/features/admin/actions";
import { inquiryStatusValues } from "@/lib/validation/adminInquiry";
import type { InquiryStatus } from "@/lib/supabase/database.types";

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  archived: "Archived",
};

/**
 * Module 7A — the one interactive control in the admin area that
 * mutates data. Optimistic-ish: reverts the select back to the prior
 * value on failure rather than trusting the browser's choice (spec
 * §11 — surfaces status-update success/error inline, no full reload).
 *
 * `type` + `id` are just passed straight through to
 * `updateInquiryStatusAction` (`features/admin/actions.ts`), which is
 * where the actual authorization/validation happens — this component
 * trusts nothing about its own inputs being safe.
 */
export function StatusSelect({
  type,
  id,
  initialStatus,
}: {
  type: "contact" | "project";
  id: string;
  initialStatus: InquiryStatus;
}) {
  const [status, setStatus] = useState<InquiryStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    const previous = status;
    const nextStatus = next as InquiryStatus;
    setStatus(nextStatus);
    setError(null);
    setJustSaved(false);

    startTransition(async () => {
      const result = await updateInquiryStatusAction(type, { id, status: nextStatus });
      if (!result.ok) {
        setStatus(previous);
        setError(result.message);
        return;
      }
      setJustSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        aria-label="Inquiry status"
        value={status}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="w-auto min-w-[10rem]"
      >
        {inquiryStatusValues.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABEL[value]}
          </option>
        ))}
      </Select>
      {pending ? (
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>Saving…</span>
      ) : justSaved ? (
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Status updated.</span>
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : null}
    </div>
  );
}
