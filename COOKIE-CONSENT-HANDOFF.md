# COOKIE CONSENT BANNER — HANDOFF

## What was added

A self-built cookie-consent banner — no third-party consent-management
vendor (Cosinsent/Klaro or otherwise).

- `src/lib/utils/cookieConsent.ts` — plain `document.cookie` read/write
  helpers. Stores one cookie, `6stanza_cookie_consent=accepted`, for
  180 days (`path=/; SameSite=Lax; Secure`).
- `src/components/ui/CookieConsentBanner.tsx` — the banner itself.
  Checks for the stored consent value on mount (`useEffect`, so there's
  no SSR/client render mismatch); if absent, shows a fixed bottom
  banner with a short explanation, a link to `/privacy-policy#cookies`,
  and a single "Got it" button that records consent and dismisses it.
- Mounted once in `src/app/(site)/layout.tsx`, alongside the existing
  `WhatsAppButton`/`LazyFaqChatbot` — so it appears on every public
  page, not `/admin/*` (matches how those two are already scoped).

## Why a single "Got it" button, not Accept/Reject

This site currently sets exactly one other cookie: Supabase's own
strictly-necessary auth session cookie (see the Cookies section of
`src/features/legal/data/privacyPolicy.ts` — no analytics, ads, or
tracking scripts exist anywhere in the codebase). Strictly-necessary
cookies aren't subject to opt-in consent under GDPR/ePrivacy or
similar frameworks, so there's nothing non-essential to gate behind a
Reject control — building one would imply a choice that doesn't
actually exist yet. This banner is an honest disclosure + acknowledgment,
not a permission gate.

**If a non-essential cookie is added later** (analytics, ads,
personalization), this is the file to extend — add a second stored
category (e.g. `analytics: "granted" | "denied"`) and Accept/Reject
controls at that point, rather than rebuilding the banner.

## Files changed

**New:**
- `src/lib/utils/cookieConsent.ts`
- `src/components/ui/CookieConsentBanner.tsx`

**Modified:**
- `src/app/(site)/layout.tsx` — imports and renders `CookieConsentBanner`

No changes were needed to `src/features/legal/data/privacyPolicy.ts` —
its Cookies section already has `id: "cookies"` (via
`LegalDocumentPage`'s existing `id={section.id}` on each heading), so
the banner's `/privacy-policy#cookies` link already resolves correctly.

## Verification

Not run in this sandbox (no npm registry access — same limitation as
every prior handoff in this repo). Manually verify:

- First visit (no `6stanza_cookie_consent` cookie) → banner appears.
- Click "Got it" → banner dismisses, cookie is set, and the banner
  does not reappear on reload or on navigating between pages.
- `/privacy-policy#cookies` link scrolls to the correct section.
- Banner does not render on `/admin/*` routes.
- Mobile widths (320–430px) — banner and button remain usable, don't
  overlap the WhatsApp button awkwardly.
