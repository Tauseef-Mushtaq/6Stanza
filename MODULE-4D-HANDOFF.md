# MODULE 4D — HANDOFF (Team + Insights)

Scope: build `/team`, `/insights`, and `/insights/[slug]` only. **Modules
0–3 and 4A–4C were not touched** beyond one small, additive, backward-
compatible extension to `src/features/home/data/team.ts` (see below).
No homepage section, motion primitive, design token, About/Services/
Projects file was modified.

## Before writing code — what I found reading the actual source

- `src/app/team/page.tsx` and `src/app/insights/page.tsx` were still
  Module 0 `RoutePlaceholder` stubs — a clean slate, no prior Module 4D
  work to preserve.
- The homepage already has **two** team sections in the codebase:
  `src/features/home/sections/Team.tsx` (a static card-grid, now dead —
  not imported anywhere) and `TeamJourney.tsx` (a `HorizontalScroller`
  gallery, the one actually rendered by `src/app/page.tsx`). Per this
  module's explicit instruction not to just copy the homepage section,
  `/team`'s `TeamSequence` reuses the same `HorizontalScroller`
  *mechanism* (continuous scrub, no snapping) but is a materially
  different composition: taller 3:4 portraits, a live "NN / NN — Name"
  readout driven off scroll progress, and its own layout — not a
  resized copy of `TeamJourney`.
- `src/features/about/data/process.ts` already holds the six-step
  delivery sequence About uses. Reused as-is for the Team page's "How
  We Work" chapter (§14 explicitly asks for this), rendered in a third,
  visually distinct way (an inline connected row with arrow glyphs) —
  About uses `HorizontalScroller` cards, so a second `HorizontalScroller`
  instance for the same data on a different page would have read as a
  duplicate, not a companion.
- `src/features/home/data/sixS.ts` reused as-is for the Team page's
  Culture chapter — a compact pill/chip strip, deliberately much
  lighter-weight than both the homepage's pinned Six S journey and
  About's alternating-connector Philosophy chapter (§15 explicitly
  warns against a third full restaging).
- No existing insights/articles data anywhere in the repo — built the
  full data model and content from scratch under `src/features/insights/`.

## One small extension to existing Module 3 data (justified, not a rewrite)

`src/features/home/data/team.ts`'s `TeamMember` interface gained two
**optional/additive** fields, per this module's own instructions (§8,
§12) to build for real photography and per-member detail without a
second data source:

```ts
discipline: string;   // required — "Strategy" / "Engineering" / "Design" / "Security"
image?: string;        // optional — real portrait path, absent today
```

All four existing entries were given a `discipline` value derived
directly from their existing `role` field (no invented information).
`image` is optional and unset for all four — every new component that
reads it (`TeamSequence`, `TeamFocus`) already falls back to the
existing `initials` placeholder when absent, and the two untouched
homepage consumers (`Team.tsx`, `TeamJourney.tsx`) don't reference
either new field, so nothing about their rendering changed. This is
the only edit made outside `src/features/team/`, `src/features/insights/`,
`src/app/team/`, and `src/app/insights/`.

## Architecture

```
src/features/team/
  sections/
    TeamHero.tsx              NEW — Chapter 01
    TeamIntro.tsx              NEW — Chapter 02
    TeamSequence.tsx           NEW — Chapter 03 (horizontal, client)
    TeamFocus.tsx               NEW — Chapter 04
    HowWeWork.tsx                NEW — Chapter 05
    TeamCulture.tsx               NEW — Chapter 06
    TeamFinalTransition.tsx        NEW — Chapter 07

src/features/insights/
  data/
    insights.ts                NEW — article data model + 5 placeholder articles
  sections/
    InsightsHero.tsx            NEW — /insights Chapter 01
    FeaturedInsight.tsx          NEW — /insights Chapter 02
    InsightsList.tsx               NEW — /insights Chapter 03
    ArticleHero.tsx                 NEW — detail Chapter 01
    ArticleIntro.tsx                 NEW — detail Chapter 02
    ArticleContent.tsx                NEW — detail Chapter 03+ (block renderer)
    ArticleFooter.tsx                  NEW — detail footer (§27)

src/app/team/page.tsx           MODIFIED (was RoutePlaceholder stub)
src/app/insights/page.tsx        MODIFIED (was RoutePlaceholder stub)
src/app/insights/[slug]/page.tsx  NEW — one dynamic route for every article
```

One reusable article template, not one page file per article, per §23
— exactly the `[slug]` + `generateStaticParams` + `notFound()` pattern
Module 4B established and 4C reused, including its async
`params: Promise<{ slug }>` signature (confirmed against the actual
Next.js 16.3.1 project, not assumed).

## Routes created

```
/team
/insights
/insights/boring-infrastructure-is-a-feature
/insights/security-as-architecture-not-checklist
/insights/designing-for-the-load-you-will-actually-have
/insights/the-real-cost-of-a-missing-cicd-pipeline
/insights/strategy-before-stack
```

`src/config/routes.ts` was not touched — `/team` and `/insights` were
already in `primaryNav`; article detail pages are reached from
`FeaturedInsight`, `InsightsList`, and each article's `ArticleFooter`
"Next Insight" link, not from primary nav.

## Team page — seven chapters

1. **`TeamHero`** — full-viewport dark opener, `--header-h` clearance,
   `SplitHeading` statement, a large background numeral (team headcount,
   not an arbitrary "01").
2. **`TeamIntro`** — short editorial statement grounded in the site's
   existing positioning language (technology partner, discipline
   ownership) — no invented achievements.
3. **`TeamSequence`** — the cinematic horizontal sequence (§9/§10):
   `HorizontalScroller` drives tall 3:4 editorial portraits; a client-
   side `onProgress` readout above the strip shows the current
   member's name/role/index, updating continuously with scroll (no
   snapping, per §29).
4. **`TeamFocus`** — individual focus (§13): one member at a time,
   full-width alternating stack (same technique as Projects'
   `FeaturedProjects`, re-oriented for a person), discipline eyebrow +
   name + role + existing bio only.
5. **`HowWeWork`** — the existing `processSteps` reused, shown as an
   inline connected row with arrow glyphs — visually distinct from
   About's `HorizontalScroller` card version of the same data.
6. **`TeamCulture`** — the existing `sixS` principles as a restrained
   pill/chip strip — a third, lightweight treatment of that data.
7. **`TeamFinalTransition`** — closing chapter into `/start-project`
   (existing `ctaRoute`), not a contact form.

## Insights — landing + article template

**`/insights`** (3 chapters):
1. `InsightsHero` — full-viewport dark opener, article count in the
   eyebrow.
2. `FeaturedInsight` — the first article (`insights[0]`) as one
   dominant, full-width editorial layout — never inside a small card.
3. `InsightsList` — the remaining four articles as a numbered editorial
   list with dividers and a hover arrow — an index, not `[card][card]`.

**`/insights/[slug]`** (4 chapters, composed in the one dynamic route):
1. `ArticleHero` — category, `SplitHeading` title, date + reading time,
   "← Back to Insights".
2. `ArticleIntro` — the article's excerpt rendered large, as its own
   chapter (not the first line of body copy).
3. `ArticleContent` — the actual reading column (`max-w-[68ch]`,
   `--text-body-lg` paragraphs, real line-height), rendering a typed
   `InsightBlock[]` (`paragraph` / `heading` / `quote` / `list` /
   `code` / `callout`) — only the block types an article actually
   contains are ever rendered; nothing is added just to look
   technical (§26).
4. `ArticleFooter` — "Next Insight" as a large `SplitHeading` link
   (wraparound through the array) plus an explicit "← Back to
   Insights" link — both real, keyboard-focusable `<Link>`s.

## Insights data — original placeholder content, not fabricated claims

`src/features/insights/data/insights.ts` holds 5 original articles
covering categories drawn directly from 6STANZA's actual services
(Engineering, Cloud, DevOps, Cyber Security, Strategy). Content is
general technical thinking (infrastructure discipline, threat
modeling, capacity planning, CI/CD, strategy-before-stack) — **no
claims about specific client work, results, or company history are
made anywhere in this content**, satisfying §40's prohibition on
fabricated business claims. Treat this as a structurally-correct first
draft for the reading experience, not reviewed/published editorial —
same caveat prior modules noted for their own placeholder copy.

## Shared primitives reused (nothing new was built)

`Reveal`, `SplitHeading`, `Parallax`, `ScaleReveal`, `HorizontalScroller`,
`Container`, `TechnicalLabel`, `AccentLine`, `SubtleGrid`, `Divider`,
`Header`/`Footer` (untouched, rendered by the root layout). No new
GSAP/ScrollTrigger setup, no new scroll library, no WebGL/3D scene —
the homepage Hero's scene remains the app's only 3D scene, per every
prior module's performance guidance and this brief's §34.

`TeamSequence` is the one new client component with local React state
(`useState` for `activeIndex`), used only to drive a text readout off
`HorizontalScroller`'s existing `onProgress` callback — it does not
call `gsap.to()` or `ScrollTrigger.create()` itself.

## Responsive behavior

- All typography/spacing uses the existing `clamp()`-based tokens — no
  new breakpoint values were introduced.
- `TeamSequence` and `TeamFocus` both fall back to `HorizontalScroller`'s
  and plain document flow's existing mobile behavior respectively —
  `TeamSequence`'s portraits step down from `26vw` (desktop) → `42vw`
  (tablet) → `68vw` (mobile), matching the vw-based pattern established
  by the homepage's `TeamJourney` and About's `Process`; `TeamFocus`
  stacks to a single column below `lg`, same as `FeaturedProjects`.
- `HowWeWork`'s six steps wrap from a `md:` row into a stacked column
  below `md`, with the connecting arrow glyph hidden on mobile (`hidden
  md:inline`) rather than rendered awkwardly between stacked rows.
- `InsightsList` rows collapse from a horizontal number/title/arrow row
  to a stacked column below `sm`, so the hover arrow never crowds long
  titles at narrow widths.
- `ArticleContent`'s reading column is `max-w-[68ch]` at every
  breakpoint — comfortable line length is the whole point of that
  constraint, so it was deliberately not made responsive beyond the
  container's own edge padding.

## Accessibility

- No new reduced-motion implementation. Every animated element goes
  through `Reveal` / `SplitHeading` / `Parallax` / `ScaleReveal` /
  `HorizontalScroller`, all of which already read `isReducedMotion`
  from Module 2's `useGsapContext` and degrade automatically (content
  stays visible; pins/scrubs are skipped; `HorizontalScroller` falls
  back to native touch/wheel `overflow-x-auto` scroll).
- `TeamSequence`'s live readout is driven by `HorizontalScroller`'s
  existing `onProgress` callback, which — like the rest of the
  primitive — simply doesn't fire under reduced motion (no
  `ScrollTrigger` is created). The readout stays on member 01 in that
  case, but every member's name/role is still present and readable in
  the DOM inside the (now non-scrubbed, natively scrollable) strip
  itself, and again in full in `TeamFocus` immediately below — no
  information is reduced-motion-only.
- All decorative SVG (`SubtleGrid`, `FeaturedInsight`'s line/node
  graphic) is `aria-hidden`.
- Every navigational element (`Back to Insights`, `Next Insight`,
  `Read article`, each `InsightsList` row, the Team final CTA) is a
  real `<Link>` with the existing site-wide
  `focus-visible:outline-2 outline-offset-4` pattern — none of this
  module's navigation is mouse/scroll-only.
- Section headings use real `<h1>`/`<h2>`/`<h3>` elements in document
  order throughout both pages.

## Verification results (actually run, not just described)

```text
npm install        PASS (430 packages, 0 vulnerabilities)
npm run lint        PASS (0 errors, 0 warnings)
npx tsc --noEmit     PASS
npm run build        PASS — route tree includes:
                             ○ /team
                             ○ /insights
                             ● /insights/boring-infrastructure-is-a-feature
                             ● /insights/security-as-architecture-not-checklist
                             ● /insights/designing-for-the-load-you-will-actually-have
                             ● /insights/the-real-cost-of-a-missing-cicd-pipeline
                             ● /insights/strategy-before-stack
                             (all prerendered via generateStaticParams,
                             alongside every pre-existing route unchanged)
npm run dev          PASS — curled and confirmed HTTP 200 for:
                             /, /team, /insights,
                             /insights/boring-infrastructure-is-a-feature,
                             /insights/strategy-before-stack,
                             /about, /services, /projects
                             — and HTTP 404 for /insights/not-a-real-slug
                             (confirms notFound() works, not just the
                             happy path)
```

Case-sensitive import audit: every new `@/...` import introduced by
this module was checked against on-disk file casing; no mismatches.
Homepage HTML was also spot-checked to confirm the `team.ts` field
addition didn't change its rendered output.

## Known limitations

- **No visual/browser screenshot QA was performed.** This environment
  has no interactive browser/Playwright available — the same
  limitation noted in every prior module's handoff. Verification above
  relies on build/typecheck/lint plus `curl` HTTP-status and content
  checks against `next dev`, which is a strong signal but not a
  substitute for a human visual pass — **please open `/team` and
  `/insights` (+ at least two article pages) in a real browser, desktop
  and mobile, before merging.** Specifically check: `TeamSequence`'s
  horizontal strip and its live readout at 1440/768/390px, and the
  reading column's measure/line-height on `/insights/[slug]` at each
  breakpoint listed in §31.
- No real team photography exists yet. `image` is defined on
  `TeamMember` but unset for all four members — `TeamSequence` and
  `TeamFocus` are the two places to drop in real portraits; no layout
  change is needed when that happens.
- No real article imagery exists yet — `FeaturedInsight`'s visual is an
  abstract SVG line/node placeholder in the same restrained visual
  language used elsewhere on the site (Services' `ServiceVisual`,
  Projects' `ProjectVisual`), not a fake photograph.
- Insights content (all 5 articles) is original placeholder editorial
  written to validate the reading experience and block-renderer
  architecture — it has not been reviewed by anyone at 6STANZA. Treat
  it the same way prior modules flagged their own placeholder copy
  (`serviceDetails.ts`, `projectDetails.ts`): structurally sound, not
  final.
- `TeamSequence`'s active-member readout re-renders React state on
  every `HorizontalScroller` scroll tick (via `onProgress`). This is a
  lightweight text swap, not a layout-affecting update, and matches the
  granularity `ServiceRail`/`ServiceProgression` already use elsewhere
  in the app — but if a future module profiles jank on low-end mobile
  during this specific interaction, throttling the state update
  (rather than the scrub itself, which should stay continuous per §29)
  would be the fix.

## Instructions for Module 4E

- Do not rebuild Modules 0–3, 4A–4C, or this module. Everything under
  `src/features/team/`, `src/features/insights/`, `src/app/team/`, and
  `src/app/insights/` is considered final for this pass.
- `TeamMember.image` and `TeamMember.discipline` are now part of the
  canonical data shape — if a future module (or a CMS integration) adds
  real photography, `TeamSequence` and `TeamFocus` are the only two
  places that need to render it; the data shape already supports it.
- If Module 4E (Contact / Start a Project) needs a "next step" pattern
  similar to `ArticleFooter`'s wraparound link, or a numbered editorial
  list similar to `InsightsList`, reuse those rather than inventing a
  fourth variant of an already-established pattern.
- `insights.ts`'s `InsightBlock` union is intentionally small (6
  variants). If real articles need something it doesn't cover, extend
  the union and `ArticleContent`'s renderer — don't build a second,
  parallel content model.
