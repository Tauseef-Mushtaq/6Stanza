# ACTIVE NAV HIGHLIGHTING — HANDOFF

## What changed

`src/components/layout/Header.tsx` now highlights whichever page the
visitor is currently on, in both the desktop and mobile nav.

- Added `usePathname()` (Header was already a client component, so
  this needed no new "use client" boundary).
- New `isRouteActive(href, pathname)` helper: `/` matches only the
  exact home page; every other route (`/services`, `/about`, etc.)
  also stays highlighted on its own detail pages — e.g. visiting
  `/services/web-development` keeps "Services" highlighted, since
  that page is still "within" Services.
- **Desktop nav** — the active link's text turns
  `var(--color-brand-soft)` (the same soft-blue already used for
  hover) and gets a small bottom border in the same color, so it
  reads as "on" rather than just "hovered." Also sets
  `aria-current="page"` for assistive tech.
- **Mobile nav** — same color change on the active link, same
  `aria-current="page"`.
- **Logo / Home** — `primaryNav` doesn't include an explicit "Home"
  link (the wordmark next to the logo serves that role), so the logo
  text is highlighted the same way when the visitor is on `/`.

## Why route-prefix matching, not exact-only

Exact matching would leave "Services" unhighlighted while browsing an
individual service or project detail page, which would look broken
rather than helpful. Prefix matching (`pathname === href ||
pathname.startsWith(href + "/")`) keeps the parent nav item lit up
anywhere under that section — the common, expected pattern. Home is
deliberately the one exception (exact match only), since every route
technically starts with `/`.

## Files changed

- `src/components/layout/Header.tsx` (only file touched)

## Verification

Not run in this sandbox (no npm registry access). Manually verify:

- Visit `/`, `/about`, `/services`, `/projects`, `/team`, `/insights`,
  `/contact` — each nav item highlights only while on its own page.
- Visit `/services/<any-slug>` — "Services" stays highlighted.
- Mobile menu (< md breakpoint) shows the same highlighting.
- Pages with no matching nav item (`/start-project`,
  `/privacy-policy`, `/login`, etc.) show no nav item highlighted —
  expected, since none of those are in `primaryNav`.
