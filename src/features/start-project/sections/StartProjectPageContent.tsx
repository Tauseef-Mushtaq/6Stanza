"use client";

import { useEffect, useState } from "react";
import { StartProjectHero } from "@/features/start-project/sections/StartProjectHero";
import { ProjectForm } from "@/features/start-project/sections/ProjectForm";
import { SuccessState } from "@/features/start-project/sections/SuccessState";
import { takeDiscoveryPrefill } from "@/features/discovery/lib/prefillBridge";
import type { ProjectInquiry } from "@/features/start-project/data/inquiry";

/**
 * Client-side composition root for /start-project. Owns the single
 * piece of cross-section state (whether the form has succeeded) so
 * the route's `page.tsx` can stay a plain server component wrapper.
 *
 * Module: Smart Project Discovery handoff — also reads (and clears)
 * any pending discovery prefill shortly after mount and passes it to
 * `ProjectForm` as initial values (see the `useEffect`/`key` comments
 * below for why it's done this way rather than synchronously).
 */
export function StartProjectPageContent() {
  const [submitted, setSubmitted] = useState(false);
  // Module: Consultation Booking 1 — kept only to prefill the
  // "Book a Consultation" link's query params (name/email) on
  // `SuccessState`; not sent anywhere, not re-validated, and does not
  // change what `submitInquiry` already sent to the server.
  const [submittedInquiry, setSubmittedInquiry] = useState<ProjectInquiry | null>(null);
  const [initial, setInitial] = useState<Partial<ProjectInquiry> | undefined>(undefined);

  // Deliberately `useEffect`, not a `useState` lazy initializer: this
  // is a "use client" component, so it's still server-rendered first
  // (where `window`/`sessionStorage` don't exist) and then hydrated.
  // Computing the prefill during the initial render would make that
  // render's output differ between server and client and trip a
  // hydration mismatch on the (controlled) form inputs. Reading it in
  // an effect keeps the very first client render identical to the
  // server-rendered markup (so `ProjectForm` still renders on the
  // server/first paint exactly as before, unchanged for the common
  // case with no prefill), then applies the prefill as a normal
  // post-mount state update.
  useEffect(() => {
    const prefill = takeDiscoveryPrefill();
    if (prefill) setInitial(prefill);
  }, []);

  if (submitted) return <SuccessState name={submittedInquiry?.name} email={submittedInquiry?.email} />;

  return (
    <>
      <StartProjectHero />
      {/*
        `ProjectForm` only reads its `initial` prop once, at its own
        mount (it becomes freely user-editable after that). Since the
        prefill above resolves one render after this component's own
        first mount, `key` forces a clean remount exactly when a real
        prefill arrives — mounting a fresh `ProjectForm` instance with
        `initial` already set, rather than updating a prop the already-
        mounted instance would silently ignore. In the (overwhelmingly
        common) no-prefill case, `initial` never changes and this key
        never changes either, so `ProjectForm` mounts once, exactly as
        it did before this module existed.
      */}
      <ProjectForm
        key={initial ? "discovery-prefill" : "default"}
        onSuccess={(inquiry) => {
          setSubmittedInquiry(inquiry);
          setSubmitted(true);
        }}
        initial={initial}
      />
    </>
  );
}
