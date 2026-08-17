import type { ProjectInquiry } from "@/features/start-project/data/inquiry";

/**
 * Submission boundary for the project-intake form.
 *
 * There is no backend in this module (Module 4E is frontend-only, per
 * spec §13/§26) — this function is the single place a future module
 * should wire up to a real endpoint. Everything above this function
 * (the form, validation, loading/error/success states) is already
 * written against this contract and does not need to change when a
 * real API exists.
 *
 * TODO (next module / backend phase): replace the body below with a
 * real request, e.g.:
 *
 *   const res = await fetch("/api/inquiries", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(inquiry),
 *   });
 *   if (!res.ok) throw new Error("Submission failed");
 *
 * Until then this resolves after a short simulated delay so the
 * loading state is exercised honestly, and rejects if given no
 * message (defensive parity with validateInquiry) so the error-state
 * UI path is real, reachable code rather than dead code.
 */
export async function submitInquiry(inquiry: ProjectInquiry): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!inquiry.message.trim()) {
    throw new Error("Submission failed — no message provided.");
  }
}
