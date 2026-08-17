# MODULE 0 — HANDOFF

Foundation for the 6STANZA frontend. Read this before starting any later module.

## What was created

A Next.js (App Router) + TypeScript + Tailwind v4 project with the motion,
3D, and layout plumbing needed for later cinematic modules, plus placeholder
pages for every planned route.

## Architecture decisions

- **Structure**: `src/{app,components/{ui,layout},lib/{motion,three,utils},hooks,config,features}`
  as specced. `features/` exists but is empty — later modules put
  page-specific composed sections there (e.g. `features/services/`).
- **Styling**: Tailwind v4, CSS-first config (no `tailwind.config.ts`).
  All design values live as CSS custom properties in `src/app/globals.css`
  under `:root`, re-exposed to Tailwind via `@theme inline`. Components
  consume tokens via `var(--token-name)` — never raw hex/px.
- **Fonts — IMPORTANT**: `next/font/google` was **not** used. The sandbox
  network this was built in does not allow `fonts.googleapis.com` /
  `fonts.gstatic.com`, and per spec §7 ("if external fonts create
  unnecessary build/network problems, prefer a robust local-font
  strategy") the three font tokens (`--font-stz-display`, `--font-stz-sans`,
  `--font-stz-mono`) currently resolve to system font stacks. **To bring
  in real typefaces**: drop woff2 files into `src/app/fonts/`, load them
  with `next/font/local`, and point the three CSS vars at the resulting
  font variables in `globals.css`. No component or token consumer needs
  to change.
- **cn() helper**: `src/lib/utils/cn.ts` wraps clsx + tailwind-merge. Use
  this for all conditional/merged className logic.

## Installed dependencies

Added on top of the default Next.js scaffold:
`gsap`, `lenis`, `three`, `@react-three/fiber`, `@react-three/drei`,
`clsx`, `tailwind-merge`.

No other libraries were added. Do not add animation libraries that
duplicate GSAP/Lenis/R3F.

## Motion architecture

```
Lenis  ->  scroll position  ->  ScrollTrigger  ->  GSAP timelines
```

- `src/lib/motion/gsap.ts` — **the only place** `gsap.registerPlugin(ScrollTrigger)`
  is called. Always `import { gsap, ScrollTrigger } from "@/lib/motion/gsap"`,
  never import `"gsap"` directly, or you risk duplicate plugin registration.
- `src/lib/motion/lenis.ts` — exposes `getLenisInstance()` / `setLenisInstance()`.
  Only one `new Lenis()` call should ever exist in the app; it lives in...
- `src/components/layout/SmoothScrollProvider.tsx` — a client component
  wrapping the whole app (mounted in `src/app/layout.tsx`). Creates the
  Lenis instance, drives it from `gsap.ticker`, and forwards scroll events
  to `ScrollTrigger.update`. Skips Lenis entirely (native scroll) when
  `prefersReducedMotion()` is true.
- `src/hooks/useReducedMotion.ts` — `useReducedMotion()` hook for React
  components, and `prefersReducedMotion()` plain function for imperative
  code (GSAP callbacks, R3F frame loops). Use these, don't re-query
  `matchMedia` elsewhere.

No scroll-driven timelines, pins, or horizontal scroll exist yet — that's
explicitly out of scope for Module 0.

## Three.js architecture

```
ExperienceCanvas  ->  Scene  ->  Object / Model
```

- `src/lib/three/ExperienceCanvas.tsx` — the shared `<Canvas>` shell.
  Takes scene content as `children` so the object/scene is replaceable
  without touching this file. Handles responsive sizing, DPR cap `[1,2]`,
  and a `reducedMotionFallback` prop.
- `src/lib/three/loadExperienceCanvas.tsx` — `next/dynamic` wrapper
  (`ssr: false`) around the above. **Import this**, not `ExperienceCanvas`
  directly, from any page/section that needs 3D — this is what keeps
  Three.js out of the bundle for routes that don't use it.

No 3D scene/object has been built yet (no cube, no wireframe — per spec).

## Design-token architecture

Everything is in `src/app/globals.css`:
- Brand color primitives (`--stz-*`) → semantic tokens (`--color-*`)
- Typography scale (`--text-*`, `--leading-*`, `--tracking-label`)
- Layout (`--container-max`, `--container-padding`, `--space-section`,
  `--radius-*`)
- Shadows (`--shadow-*`)
- Motion (`--duration-*`, `--ease-*`)
- Z-index layers (`--z-*`)
- Cinematic surfaces prepared but unused: `--surface-glass`,
  `--surface-glow`, `--surface-grid-line`, `--surface-transition`

A `prefers-color-scheme: dark` block remaps the semantic background/
foreground tokens. A `prefers-reduced-motion: reduce` block sets a CSS-level
animation/transition kill-switch as a safety net under the JS-level checks.

## UI primitives (`src/components/ui/`)

`Container`, `Section`, `FullScreenSection`, `SectionHeading`,
`TechnicalLabel`, `NumberIndicator`, `Divider`. All generic, token-driven,
carry no finished visual identity. `NumberIndicator` and `TechnicalLabel`
are the pieces the future Services numbered/compass experience will
compose with.

## Layout (`src/components/layout/`)

- `Header.tsx` / `Footer.tsx` — structural only, static, no scroll
  behavior. Nav items come from `src/config/routes.ts`.
- `SmoothScrollProvider.tsx` — see Motion architecture above.
- `RoutePlaceholder.tsx` — shared placeholder UI used by every route
  below except a later-built homepage.

## Config (`src/config/`)

- `routes.ts` — `primaryNav` array + `ctaRoute`, single source of truth
  for navigation. Add new routes here, not by hardcoding links.
- `site.ts` — name/tagline/URL metadata.

## Routes created

`/` (homepage placeholder) and placeholders for `/about`, `/services`,
`/projects`, `/team`, `/insights`, `/contact`, `/start-project`. All use
`RoutePlaceholder` and inherit fonts/tokens. None have real layout/content.

## What is intentionally NOT implemented yet

- Final homepage design
- Services numbered/compass scroll experience
- Six S cinematic section
- Team cards
- Projects showcase
- Cinematic navbar animation/behavior
- Any GSAP timelines, ScrollTrigger pins, horizontal scroll
- Any Three.js scene/object
- Real typefaces (system font stack in place, see Fonts note above)
- Supabase / contact form submission wiring
- Mobile nav menu interaction (header nav is `hidden md:flex` only)

## Verification (run from `6stanza/`)

```text
npm install        PASS (already installed in this environment)
npm run lint       PASS
npx tsc --noEmit   PASS  (note: "typecheck" is not a defined script; use this or add one)
npm run build      PASS — all 9 routes (/, /about, /contact, /insights,
                          /projects, /services, /start-project, /team,
                          /_not-found) prerender as static content
```

`npm run dev` was not started for this handoff; build output confirms
static prerendering succeeded for every route with no console-breaking
errors possible at build time.

## Conventions for later modules

- Never import `"gsap"` or instantiate `new Lenis()` outside the two
  files named above.
- Never import `ExperienceCanvas` directly outside `loadExperienceCanvas.tsx`.
- Consume `var(--token)` from `globals.css`; don't add raw color/spacing
  values in components.
- Add new nav routes to `src/config/routes.ts`.
- Keep `features/<name>/` for page-specific composed sections; keep
  `components/ui/` generic and reusable.
