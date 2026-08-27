"use client";

/**
 * Cookie-consent storage — plain `document.cookie`, no third-party
 * consent-management vendor (per request: "build it yourself... no
 * third-party vendor needed"). Client-only by design: this only ever
 * needs to gate a UI banner, not a server-side decision, so there's
 * no need for this to be readable during SSR.
 *
 * This site currently sets exactly one other cookie — Supabase's own
 * auth session cookie (see `src/features/legal/data/privacyPolicy.ts`'s
 * Cookies section) — which is strictly necessary and not gated by
 * consent. This banner exists to disclose that plainly and to give
 * visitors an explicit acknowledgment action, consistent with what
 * the Privacy Policy already states.
 */

export const COOKIE_CONSENT_NAME = "6stanza_cookie_consent";
const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export type CookieConsentValue = "accepted";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredCookieConsent(): CookieConsentValue | null {
  const value = readCookie(COOKIE_CONSENT_NAME);
  return value === "accepted" ? "accepted" : null;
}

export function setStoredCookieConsent(value: CookieConsentValue): void {
  if (typeof document === "undefined") return;
  // `Secure` is only valid over HTTPS; harmless to include since this
  // site is served over HTTPS in every real environment, and browsers
  // simply drop the attribute (not the cookie) on plain HTTP.
  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(value)}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax; Secure`;
}
