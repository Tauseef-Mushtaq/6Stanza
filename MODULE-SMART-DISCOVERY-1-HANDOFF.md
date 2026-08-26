# MODULE-SMART-DISCOVERY-1 — Handoff

## What shipped

A new, standalone Smart Project Discovery experience at `/discovery`: a
4–6 question (5, in this build) guided flow that deterministically
recommends 1–3 6STANZA services with reasons, then hands off to the
existing `/start-project` form with relevant fields safely prefilled and
fully editable.

See `docs/product/project-discovery.md` for the full design/architecture
writeup. This document is the short "what changed and why" for whoever
picks this up next.

## New files

```
src/features/discovery/data/questions.ts
src/features/discovery/lib/recommend.ts
src/features/discovery/lib/prefillBridge.ts
src/features/discovery/components/DiscoverySingleSelect.tsx
src/features/discovery/components/DiscoveryRecommendation.tsx
src/features/discovery/components/DiscoveryFlow.tsx
src/features/discovery/sections/DiscoveryPageContent.tsx
src/app/(site)/discovery/page.tsx
docs/product/project-discovery.md
MODULE-SMART-DISCOVERY-1-HANDOFF.md
```

## Modified files (all additive / backward-compatible)

- **`src/features/start-project/sections/ProjectForm.tsx`** — added one
  optional prop, `initial?: Partial<ProjectInquiry>`, used only to seed
  the component's own local `useState`. When omitted (every pre-existing
  call site, and every direct visit to `/start-project`), behavior is
  identical to before. Also renders one small notice banner ("Prefilled
  from your Smart Project Discovery answers…") when `initial` is present.
  `validateInquiry` and `submitInquiry` are untouched.
- **`src/features/start-project/sections/StartProjectPageContent.tsx`** —
  reads (and clears) any pending discovery prefill in a `useEffect` after
  mount, and passes it to `ProjectForm`. Uses a `key` on `ProjectForm` to
  force a clean remount exactly when a real prefill arrives (see inline
  comments for why — `ProjectForm` only reads `initial` once, at its own
  mount, and the prefill resolves one render after `StartProjectPageContent`
  itself mounts).
- **`src/features/start-project/sections/StartProjectHero.tsx`** — added
  one link ("Not sure yet? Try Smart Project Discovery →") pointing to
  `/discovery`. No other change.

## What deliberately did NOT change

- `src/features/start-project/actions.ts` — untouched.
- `src/features/start-project/lib/submitInquiry.ts` — untouched.
- `src/features/start-project/data/inquiry.ts` (validation, canonical
  `ProjectInquiry` shape, `timelines`/`projectStages`/`budgetRanges`) —
  untouched; Q4 in discovery imports `timelines` directly from here rather
  than redefining it.
- `src/features/home/data/services.ts` (canonical service slugs) —
  untouched; the recommendation engine imports this list and cross-checks
  its own rule table against it at recommend time, so it can never surface
  a slug that isn't actually in the live catalog.
- Any Supabase schema, migration, or repository — no new table. The
  discovery → start-project handoff is a same-tab `sessionStorage`
  write/read (`prefillBridge.ts`), not persistence.
- No AI/model call anywhere in the recommendation path — see
  `src/features/discovery/lib/recommend.ts`, a plain deterministic rule
  table.

## Verification status

The three requested commands —

```bash
npm run lint
npx tsc --noEmit
npm run build
```

**could not be run in this sandbox.** `npm install` fails partway through
with a `403 Forbidden` from the npm registry proxy on one transitive
dependency (`zustand`), unrelated to anything in this patch, before it
finishes installing the tree needed to run any of the three commands. No
`node_modules` exists in this environment as a result.

**What was done instead:** every new/modified file was manually reviewed
against the actual signatures of the existing code it calls into
(`ServiceSelector`, `OptionPills`, `Reveal`, `Button`, `Container`,
`TechnicalLabel`, `Divider`/`AccentLine`/`SubtleGrid`, `SplitHeading`,
`ProjectInquiry`, `submitInquiry`, `webPageSchema`/`breadcrumbSchema`) by
reading their real source in this codebase, not from memory/assumption.
Import paths, prop names, and types were cross-checked by hand.

**Action needed from you:** run the three commands above in an environment
where `npm install` succeeds, before merging. Given the scope of this
patch (new self-contained feature folder + three small additive edits to
existing files), the most likely class of issue a real compile would catch
is a typo in an import path or prop name — not an architectural problem.

## Manual test plan

1. **New flow:** visit `/discovery` → answer all 5 questions → confirm a
   recommendation of 1–3 services appears, each with a reason → click
   "Talk to 6STANZA" → confirm you land on `/start-project` with Project
   Title, Services, Timeline, and Message prefilled and the "Prefilled
   from your Smart Project Discovery answers" notice visible → edit one or
   more fields → submit → confirm the existing success state appears and
   the submission lands in the admin inquiries list as normal.
2. **Ambiguous-answers fallback:** answer "Not sure" (or leave optional Q5
   empty) throughout → confirm you still get exactly one recommendation
   (Web Development) with softer framing, not an empty/broken result.
3. **Back/Next/Restart:** step forward, click Back, confirm your previous
   answer is still selected; click Restart mid-flow, confirm it returns to
   Question 1 of 5 with everything cleared.
4. **Validation:** try clicking Next on Q1–Q4 without selecting anything →
   confirm an inline "Pick an option to continue" message appears and the
   step does not advance. Confirm Q5 can be skipped entirely.
5. **Keyboard-only:** Tab through an entire question using only the
   keyboard; confirm every option is reachable and selectable with
   Space/Enter, and Back/Next/Restart are reachable the same way.
6. **Reduced motion:** enable "prefers-reduced-motion" in the OS/browser,
   reload `/discovery`, confirm content still appears (no animation, no
   missing content).
7. **Existing flow unaffected:** visit `/start-project` directly (not via
   `/discovery`) → confirm the form is completely empty, behaves exactly
   as before, and submits successfully — no regression from this patch.
8. **Mobile:** repeat step 1 at a narrow viewport width; confirm the
   question rows, pills, and buttons remain usable and nothing overflows.

## Known limitations / follow-ups (not in scope for this module)

- The recommendation engine's rule table currently has no path to
  recommending **Video Editing**, since none of Q1–Q3's answers naturally
  imply it — a visitor who wants it can still add it directly via the
  optional Q5 multi-select. A future module could add a "What kind of
  content do you need?" branch if this turns out to matter in practice.
- No analytics/instrumentation was added on the discovery flow itself
  (which questions get abandoned, fallback-rate, etc.) — out of scope per
  "stop after this module."
