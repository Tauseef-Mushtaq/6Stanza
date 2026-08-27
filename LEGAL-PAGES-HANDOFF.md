# PRIVACY POLICY / TERMS OF SERVICE — HANDOFF

## What was added

- `/privacy-policy` and `/terms-of-service` — two new public routes,
  rendered through one shared component (`LegalDocumentPage`) fed by
  typed content files, matching the site's existing
  data/section-component split rather than two hand-built pages.
- Both pages use the site's existing editorial visual language
  (`AccentLine`, `TechnicalLabel`, `Reveal`, design tokens) and the
  existing SEO pattern (`JsonLd` + `webPageSchema`/`breadcrumbSchema`,
  same as `/about` and `/contact`).
- Added to `sitemap.ts` via a new `legalNav` array in
  `src/config/routes.ts` (kept separate from `primaryNav` so the main
  navigation is untouched).
- Linked from the site footer (`Footer.tsx`), next to the copyright
  line — the conventional placement for legal links, and it doesn't
  disturb the existing primary-nav footer row.

## Files changed

**New:**
- `src/features/legal/data/types.ts`
- `src/features/legal/data/privacyPolicy.ts`
- `src/features/legal/data/termsOfService.ts`
- `src/features/legal/components/LegalDocumentPage.tsx`
- `src/app/(site)/privacy-policy/page.tsx`
- `src/app/(site)/terms-of-service/page.tsx`

**Modified:**
- `src/config/routes.ts` — added `legalNav`
- `src/components/layout/Footer.tsx` — renders `legalNav` links
- `src/app/sitemap.ts` — includes the two new routes

## Content basis — what this is grounded in

The Privacy Policy and Terms text were written to match what this
codebase actually does, verified against the source rather than
boilerplate:

- **Project inquiries** — the `/start-project` form's real fields
  (name, email, company, project title, services, stage, timeline,
  budget, message), per `src/features/start-project/data/inquiry.ts`.
- **Consultation booking** — Cal.com is embedded
  (`src/features/consultation-booking`) and confirmed bookings are
  recorded via a webhook (`src/app/api/webhooks/cal-booking/route.ts`).
- **Accounts** — Supabase Auth, used for the admin dashboard only; no
  public signup flow for general visitors is described as such.
- **Cookies** — only Supabase's own session cookie is disclosed. No
  analytics, ad, or tracking script exists anywhere in the codebase
  (checked for `gtag`/GA/ad-pixel code — none found), so no cookie
  consent banner was added; the Cookies section states this plainly
  rather than describing tracking that isn't there.
- **No physical address or phone number** is stated anywhere, matching
  the rest of the site (`ContactDetails.tsx` and
  `MODULE-SEO-1-HANDOFF.md` both note this was deliberately left
  unpublished) — the legal pages don't invent one either.

## Known limitations — get these reviewed before going live

This is a solid, accurate first draft, not a substitute for legal
counsel. Before treating either page as final:

- **Governing law / jurisdiction** — the Terms currently say "the laws
  applicable to `6STANZA Pvt Ltd`'s place of incorporation" rather
  than naming a specific country/province, since that wasn't
  available in the codebase. Fill in the real jurisdiction.
- **Data retention specifics** — the Privacy Policy describes
  retention in general terms ("as long as reasonably necessary").
  If you have (or want) concrete retention periods, add them.
  Any of this can be edited directly in
  `src/features/legal/data/privacyPolicy.ts` /
  `termsOfService.ts` — plain arrays of strings, no rebuild of the
  page needed for content-only changes.
- **Registered business address** — not included, matching the rest
  of the site's current practice of not publishing one. Add it to
  both documents (and to `ContactDetails.tsx`, if desired) once
  you're ready to disclose it.
- Have a lawyer familiar with your operating jurisdiction confirm
  the Terms' liability/disclaimer language and the Privacy Policy's
  rights language (the current wording is deliberately general —
  "you may have rights to..." — rather than naming a specific
  regulation like GDPR/CCPA, since it wasn't confirmed which, if any,
  currently apply to your visitor base).

## Verification

Not run in this sandbox (no npm registry access, same limitation
noted in every prior module handoff in this repo). Every file was
hand-checked against the exact import paths, design tokens, and
component props already used elsewhere in the codebase. Run
`npm install && npm run lint && npx tsc --noEmit && npm run build`
before deploying.
