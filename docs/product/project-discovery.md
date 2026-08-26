# Smart Project Discovery

A short, guided pre-qualification flow at `/discovery` that helps a visitor
figure out which 6STANZA services likely fit their project *before* they
land on the full `/start-project` form. It exists to lower the barrier for
visitors who don't yet know how to describe what they need in their own
words — not to replace or gate the existing form, which remains fully
usable on its own, unchanged.

```
Q1 What are you trying to build?
Q2 What problem are you solving?
Q3 Do you already have a system?
Q4 What's your timeline?
Q5 What services might you need?   (optional, skippable)
      ↓
Deterministic recommendation (1–3 services, each with a short reason)
      ↓
"Talk to 6STANZA" → /start-project, prefilled and fully editable
```

## Why this exists

Some visitors arrive at `/start-project` knowing exactly what they want
("we need a web app rebuilt on better cloud infra"). Others know their
*problem* but not which of 6STANZA's eight services actually addresses it.
Discovery is for the second group: five short questions, in plain language,
that map to the real service catalog behind the scenes.

## What it is not

- **Not AI.** The recommendation engine (`src/features/discovery/lib/recommend.ts`)
  is a plain, typed, deterministic rule table — the same input always
  produces the same output, and every rule is readable top-to-bottom in one
  file. No model call, no prompt, no non-determinism.
- **Not a second inquiry system.** Discovery never talks to Supabase and
  has no submit button of its own. The only thing it produces is a
  `Partial<ProjectInquiry>` (the exact same type `/start-project` already
  uses) which is handed to the real form to review and submit through the
  existing, unmodified pipeline (`ProjectForm` → `submitInquiry` →
  `submitProjectInquiryAction` → `submitProjectInquiry` service →
  repository → Supabase).
- **Not a second service catalog.** Every slug this engine can recommend
  comes from `@/features/home/data/services` — the same canonical list
  `ServiceSelector` and `ProjectForm` already render from. The engine
  cross-checks its own rule table against the live catalog at recommend
  time and silently drops anything that isn't actually in it, so a future
  edit to the services list can never produce a recommendation for a
  service that no longer exists.
- **Not persisted.** No new database table. The handoff between the two
  pages is a same-tab `sessionStorage` write, read exactly once by
  `/start-project` and then cleared — nothing about a visitor's discovery
  answers is ever stored server-side or trusted as authoritative. Final
  validation on submission is the same `validateInquiry` (client) and
  server-side validation (`projectInquirySchema` inside the existing
  service) that already gate every `/start-project` submission, prefilled
  or not.

## How the recommendation engine works

`recommend(answers, catalog)` in `src/features/discovery/lib/recommend.ts`:

1. Walks a fixed array of `Rule` objects — each a pure `(answers) => boolean`
   test paired with a service slug, a short human-readable reason, and an
   integer weight.
2. For every rule that matches, accumulates weight per slug (a slug backed
   by two independent reasons outranks one backed by a single reason) and
   keeps the single highest-weight reason to display.
3. Folds in any services the visitor picked directly in Q5 at a fixed high
   weight — a direct answer always outranks anything inferred.
4. Filters out any slug not present in the live `catalog` passed in (see
   above), sorts by weight, and returns the top 3.
5. **Safe fallback for ambiguous answers:** if literally nothing matched
   (e.g. "not sure" on every question), returns a single default
   recommendation (Web Development, with a reason inviting a scoping call)
   rather than an empty result. The UI marks this case (`isFallback: true`)
   and shows softer framing ("we need a bit more context to be precise")
   instead of presenting a guess as a confident match.

Example, matching the brief's own worked case — "New SaaS + existing
deployment problem":

- Q1 = "A web app or SaaS product" → Web Development (weight 3)
- Q2 = "Our infrastructure is unreliable, slow, or insecure" → DevOps
  (weight 3), and combined with Q1 = SaaS → an additional DevOps match
  (weight 2, total 5) plus Cloud Computing (weight 2)
- Result: **Web Development, Cloud Computing, DevOps** — the three
  highest-weighted matches, each with its own reason.

## The prefill handoff

`src/features/discovery/lib/prefillBridge.ts` exposes two functions:

- `setDiscoveryPrefill(values)` — called once, when the visitor clicks
  "Talk to 6STANZA". Writes a plain object (`projectTitle`, `services`,
  `timeline`, `message`) to `sessionStorage`.
- `takeDiscoveryPrefill()` — called once, by `StartProjectPageContent` on
  mount. Reads the value *and immediately clears it*, so a page refresh on
  `/start-project` after this runs starts from a genuinely empty form, not
  a stale re-application of old answers.

`ProjectForm` gained one new, optional, backward-compatible prop:
`initial?: Partial<ProjectInquiry>`, used only to seed its own local
`useState`. Every field it prefills is rendered through the exact same
`TextField`/`OptionPills`/`ServiceSelector` inputs as a manually-typed
value — nothing about them is read-only, locked, or treated specially on
submit. When arriving with no prefill (the overwhelming majority of visits
to `/start-project`, including all pre-existing traffic), this prop is
`undefined` and the form behaves byte-for-byte as it did before this
module existed.

## Accessibility & motion

- Every interactive control is a real, natively-focusable `<button>`
  (radio-style rows for Q1–Q3, the existing `OptionPills`/`ServiceSelector`
  for Q4/Q5) — reachable and activatable with Tab/Space/Enter with no
  additional key handling required.
- Question groups use `role="radiogroup"`/`role="radio"` with
  `aria-checked`, matching the pattern `ServiceSelector` already
  established elsewhere on the site.
- All entrance animation goes through the existing `Reveal` component,
  which already resolves to an instant, non-animated state under
  `prefers-reduced-motion` — discovery does not introduce any new motion
  primitive or bypass that behavior.
- Mobile: the flow is a single-column vertical layout capped at a
  moderate reading width (`max-width: 48rem`), matching `/start-project`'s
  own responsive approach — no separate mobile layout was needed.

## Entry points

- `/discovery` is a standalone route, linked once from the top of
  `/start-project`'s hero ("Not sure yet? Try Smart Project Discovery →").
- `/start-project` itself is unchanged in every other respect and remains
  fully reachable and usable directly, with or without visiting
  `/discovery` first.

## Files

```
src/features/discovery/
  data/questions.ts            Typed question/answer model
  lib/recommend.ts              Deterministic recommendation engine
  lib/prefillBridge.ts          sessionStorage handoff (write-once/read-once)
  components/DiscoverySingleSelect.tsx
  components/DiscoveryRecommendation.tsx
  components/DiscoveryFlow.tsx  Orchestrates the 5-question flow
  sections/DiscoveryPageContent.tsx

src/app/(site)/discovery/page.tsx   Route + metadata/JSON-LD

Modified (additive/backward-compatible only):
  src/features/start-project/sections/ProjectForm.tsx
  src/features/start-project/sections/StartProjectPageContent.tsx
  src/features/start-project/sections/StartProjectHero.tsx
```
