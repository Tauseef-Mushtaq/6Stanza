# MODULE 1 — HANDOFF

Design system, visual language, and reusable UI system, built on top of the
clean Module 0 foundation. Read this before starting Module 2.

## What was added

### Design tokens (`src/app/globals.css`)

Extended the existing token set (did not replace anything Module 0 defined):

- **Color**: added `--color-navy`, `--color-navy-deep`, `--color-white`,
  `--color-black`, `--color-text-primary/secondary/muted`, `--color-surface`,
  `--color-surface-elevated`, `--color-border-subtle`, and state colors
  `--color-success/warning/error`. All map onto the existing `--stz-*`
  primitives — no new raw hex values introduced except the three state colors.
- **Typography**: added `--text-hero`, `--text-h4`, `--text-body-lg`,
  `--text-nav`, `--text-metadata`, `--leading-relaxed`, `--tracking-tight`,
  `--tracking-wide`.
- **Spacing**: new semantic scale `--space-micro` → `--space-5xl` plus
  `--space-hero`, and `--container-max-wide` / `--container-max-narrow`.
- **Radius**: added `--radius-xl`.
- **Shadow**: added `--shadow-glow` (brand-tinted, for future interactive/3D
  highlight states).
- **Motion**: added `--duration-instant/normal` and `--ease-smooth/emphasized/cinematic`
  aliases so naming matches spec §19 exactly, while keeping the original
  Module 0 token names (`--duration-base`, `--ease-standard`, etc.) intact
  for backward compatibility — nothing that already existed was renamed or
  removed.
- Relevant new tokens were also re-exposed through the `@theme inline` block.

### JS-side motion tokens (`src/lib/motion/tokens.ts`, new)

`DURATION` and `EASE` constant objects mirroring the CSS duration/ease
tokens, for GSAP timelines in Module 2+ to import instead of hardcoding
numbers. No ScrollTrigger scenes, pins, or timelines were built — tokens
only, per spec §19.

### Brand mark (`public/6stanza-mark.png`, `src/components/ui/BrandMark.tsx`, both new)

The geometric upward mark was cropped/isolated from the provided official
logo image (background made transparent), saved as
`public/6stanza-mark.png`, and wrapped in a `<BrandMark />` component. Per
spec §6, only this mark is used in the UI — the full "6 STANZA / PVT LTD"
text lockup is not used as a UI element. No CSS/SVG re-creation of the logo
was done; the provided asset is the only source. `BrandMark` is used in the
design-system hero and footer.

### New UI primitives (`src/components/ui/`)

- `Button.tsx` — `primary | secondary | outline | ghost | dark | blue`
  variants × `sm | md | lg` sizes. Hover/active/focus/disabled states only;
  no cinematic animation (that's a later module).
- `TextLink.tsx` — `standard | underline | arrow | nav` link variants.
- `Badge.tsx` — `outline | solid | soft | status` variants with brand/neutral/
  success/warning/error tones. Distinct from the existing `TechnicalLabel`
  (eyebrows/section labels) and `NumberIndicator` (numerals), which were
  kept as-is from Module 0.
- `Card.tsx` — one flexible `Card` primitive (`standard | dark | light |
  bordered | elevated | editorial` variants) plus `CardEyebrow`,
  `CardTitle`, `CardDescription`, `CardFooter` sub-components. This is the
  single card language later modules should reuse for team/project/service/
  insight/testimonial cards — do not build parallel card systems.
- `form/Field.tsx` (new dir) — `Label`, `HelperText`, `ErrorText`,
  `FieldGroup`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`.
  Foundational only — no Start Project/contact form was assembled.
- `nav/NavPrimitives.tsx` (new dir) — `NavItem` (with optional numbered
  index + active/hover underline), `NavIndicator`, `NavGroup`,
  `SectionIndicator` (scroll-position dots), `MenuTrigger` (hamburger,
  presentational only). The real global/cinematic navigation behavior is
  Module 3's job; these are just the pieces.

### Extended existing primitives

- `Section.tsx` — added `DarkSection`, `LightSection`, `SplitSection`,
  `CenteredSection`, `EditorialSection` alongside the existing `Section`
  and `FullScreenSection` (both left untouched).
- `Divider.tsx` — added `Dot`, `AccentLine`, `CornerMarker`, `SubtleGrid`,
  `SectionNumber` decorative primitives alongside the existing `Divider`.

`TechnicalLabel`, `NumberIndicator`, `SectionHeading`, `Container` were
**not modified** — they already matched spec and are consumed as-is by the
new showcase page.

### Design-system showcase route (`src/app/design-system/page.tsx`, new)

`/design-system` — demonstrates every piece above: brand, colors,
typography, spacing, containers/grid, buttons, links, badges/eyebrows,
cards, forms, navigation primitives, section primitives, dividers/
decorative elements, motion tokens, and a responsive-breakpoint reference
strip. Built entirely from the reusable components (no one-off markup
duplicating what the primitives already do), token-driven throughout.

## Files modified (Module 0 files touched, and why)

- `src/app/globals.css` — additive token extensions only (see above); no
  existing token values were changed or removed.

No other Module 0 file was modified. Header/Footer/RoutePlaceholder,
routing, and existing routes are untouched — Module 1 did not redesign
the structural navigation (that's explicitly out of scope, per spec §16).

## Dependencies changed

None. No new packages were installed — the design system is built entirely
with the existing Tailwind v4 + `cn()` (clsx/tailwind-merge) foundation
from Module 0.

## Logo handling

- Source: the official 6STANZA logo image (provided separately from this
  prompt) contains the geometric mark + "6 STANZA" wordmark + "PVT LTD".
- The mark was cropped to its bounding box and the white background was
  made transparent via a simple threshold (pixels near-white → alpha 0),
  producing `public/6stanza-mark.png`.
- `BrandMark` renders this file via `next/image`; proportions are
  preserved (no distortion), only uniform `size` scaling is exposed.
- The full wordmark lockup was **not** extracted or used anywhere in the
  UI, per spec.

## Usage conventions for later modules

- Never hardcode colors/spacing/radii — consume `var(--token)`.
- Reuse `Card` for any future card-shaped content; don't create a
  parallel visual system per page/section.
- Reuse `Button`/`TextLink`/`Badge` rather than one-off styled anchors or
  buttons.
- Import GSAP motion numbers from `src/lib/motion/tokens.ts` (`DURATION`,
  `EASE`) instead of hardcoding seconds/bezier strings in timelines.
- Use `BrandMark`, not a re-created SVG/CSS logo, anywhere the brand
  symbol is needed (loading states, transition moments, etc. in later
  modules).
- `features/<name>/` remains empty and reserved for page-specific
  composed sections, per Module 0's convention — Module 1 did not add
  anything there.

## Known limitations

- Real typefaces are still not wired in (system font stack, per Module 0's
  note) — the type scale/tokens are ready for `next/font/local` once font
  files are available, no consumer changes needed.
- `public/6stanza-mark.png` was produced with a simple white-threshold
  transparency pass; if the source logo ever ships with genuine
  transparency, swap the file directly without touching `BrandMark.tsx`.
- No dark/light mode toggle exists — Module 0's `prefers-color-scheme`
  remap still applies automatically; the design-system page does not
  demonstrate that toggle explicitly (dark-surface examples are shown via
  `DarkSection`, not the OS-preference remap).
- No visual screenshot/browser QA was performed in this environment: the
  sandbox's network allowlist doesn't include the Playwright browser
  download host. Verification below relies on `next build`'s static
  prerender + TypeScript pass for every route, which is a strong signal
  but is not a substitute for a human visual pass before Module 2 starts
  building cinematic scenes on top of this.

## Verification (run from `6stanza/`)

```text
npm install        PASS
npm run lint       PASS
npx tsc --noEmit   PASS
npm run build      PASS — all 10 routes (/, /about, /contact, /design-system,
                          /insights, /projects, /services, /start-project,
                          /team, /_not-found) prerender as static content
npm run dev        PASS — verified / , /design-system, /team return 200
```

## Instructions for Module 2

- Build the cinematic scroll engine (GSAP timelines, ScrollTrigger scenes,
  pinning, horizontal scroll where needed) using the motion tokens in
  `src/lib/motion/tokens.ts` and the existing `SmoothScrollProvider` /
  `gsap.ts` / `lenis.ts` plumbing from Module 0 — don't create a second
  Lenis instance or re-register ScrollTrigger.
- Compose real page content (homepage hero, Six S section, services
  compass, etc.) out of the primitives in `src/components/ui/` —
  `Card`, `Button`, `Section` variants, nav primitives — rather than
  writing new one-off styled markup.
- The `/design-system` route is a living reference; keep it in sync if
  new primitives are added in later modules (optional but recommended).
- `BrandMark` is ready to use for loading/transition identity moments.
