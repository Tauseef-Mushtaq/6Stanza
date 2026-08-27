"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getStoredCookieConsent, setStoredCookieConsent } from "@/lib/utils/cookieConsent";

/**
 * Simple, self-built cookie-consent banner — no third-party
 * consent-management vendor. Mounted once in `src/app/(site)/layout.tsx`,
 * alongside `WhatsAppButton`/`LazyFaqChatbot`.
 *
 * This site currently sets only one cookie beyond this banner's own —
 * Supabase's strictly-necessary auth session cookie (see the Cookies
 * section of `src/features/legal/data/privacyPolicy.ts`) — so there is
 * no "Reject non-essential" control to build yet: there's nothing
 * non-essential to reject. This banner discloses that plainly and
 * records a simple acknowledgment. If a non-essential cookie (e.g.
 * analytics) is ever added, this is the file to extend with a second
 * choice/category rather than rebuilding it.
 *
 * Rendered only once consent hasn't already been recorded — checked
 * client-side on mount (`useEffect`, not initial state) so this never
 * causes a server/client render mismatch.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getStoredCookieConsent()) setVisible(true);
  }, []);

  function handleAccept() {
    setStoredCookieConsent("accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 flex justify-center px-4 pb-4 sm:px-6"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className="flex w-full max-w-3xl flex-col gap-4 rounded-[var(--radius-lg)] p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}
      >
        <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-normal)" }}>
          We use only the essential cookies needed to run this site — no analytics, no advertising, no tracking. See our{" "}
          <Link href="/privacy-policy#cookies" className="underline-offset-4 hover:underline" style={{ color: "var(--color-brand)" }}>
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <Button type="button" variant="primary" size="sm" onClick={handleAccept} className="shrink-0 self-start sm:self-auto">
          Got it
        </Button>
      </div>
    </div>
  );
}
