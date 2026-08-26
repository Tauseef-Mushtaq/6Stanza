import type { ProjectInquiry } from "@/features/start-project/data/inquiry";

/**
 * Hands discovery results to `/start-project` without a database table
 * or a URL full of PII/answers. `sessionStorage` because this is a
 * same-tab, same-session handoff — it's read once (on the very next
 * page load) and cleared immediately, never persisted or trusted as
 * authoritative: `ProjectForm` treats it exactly like any other user
 * input, running through the same client validation and the
 * unchanged, real `submitProjectInquiryAction` on submit.
 */
const STORAGE_KEY = "6stanza:discovery-prefill";

export function setDiscoveryPrefill(values: Partial<ProjectInquiry>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Storage can fail (private browsing, quota, disabled) — the
    // visitor can still fill the form manually, so this is a silent
    // no-op rather than a thrown error blocking navigation.
  }
}

/** Reads and clears the pending prefill, if any. Consumed exactly once — a page refresh on /start-project after this runs starts from a genuinely empty form, not a stale re-application of the same discovery answers. */
export function takeDiscoveryPrefill(): Partial<ProjectInquiry> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Partial<ProjectInquiry>) : null;
  } catch {
    return null;
  }
}
