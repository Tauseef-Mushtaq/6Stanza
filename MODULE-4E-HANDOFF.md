# MODULE 4E — HANDOFF (Contact / Start a Project)

Scope: `/contact` and `/start-project` only. Modules 0–4D were inspected
but **not modified** — no shared primitive, no homepage/about/services/
projects/team/insights file, no design token was touched.

## 1. What was implemented

Two distinct pages sharing the site's visual language but serving
different purposes, per §4/§12:

- **`/start-project`** — the primary conversion experience. A cinematic
  dark hero ("Let's build what comes next.") followed by one continuous,
  comfortably-scrolling form (not five forced 100vh sections) covering:
  project context, service selection, scope/timeline, the open-ended
  brief, and review/submit. On success, the form is replaced by a
  full-viewport success state with real navigation links.
- **`/contact`** — a lighter doorway: a shorter hero, an honest "Direct
  Contact" chapter (no fabricated email/phone), and a closing CTA
  driving into `/start-project`, which does the actual structured
  intake. It does not duplicate the form.

## 2. New files

```
src/features/start-project/data/inquiry.ts
src/features/start-project/lib/submitInquiry.ts
src/features/start-project/components/FormField.tsx
src/features/start-project/components/ServiceSelector.tsx
src/features/start-project/components/OptionPills.tsx
src/features/start-project/sections/StartProjectHero.tsx
src/features/start-project/sections/ProjectForm.tsx
src/features/start-project/sections/SuccessState.tsx
src/features/start-project/sections/StartProjectPageContent.tsx
src/features/contact/sections/ContactHero.tsx
src/features/contact/sections/ContactDetails.tsx
src/features/contact/sections/ContactCta.tsx
MODULE-4E-HANDOFF.md
```

## 3. Modified files

```
src/app/start-project/page.tsx   (was Module 0 RoutePlaceholder stub)
src/app/contact/page.tsx         (was Module 0 RoutePlaceholder stub)
```

Both are the only files inside their own route boundaries — nothing
else was touched to make this work.

## 4. Deleted files

None.

## 5. Architecture

- `src/app/start-project/page.tsx` is a plain server component that
  renders `StartProjectPageContent` (the one client component that owns
  the hero → form → success state transition). This keeps the route
  file itself trivial and matches the pattern used elsewhere in the
  project (`page.tsx` composes, feature sections do the work).
- `src/app/contact/page.tsx` needed no client state at all — it's a
  fully static composition of three sections.
- **Form primitives are feature-scoped, not promoted to
  `src/components/ui/`.** I inspected `src/components/ui/` first (per
  §1) and confirmed there is no `Input`/`Textarea`/form primitive from
  Module 1 to reuse — the design system stopped at buttons, dividers,
  badges, and typography helpers. Rather than unilaterally deciding
  those belong in the shared design system (a Module 1 boundary
  decision I don't own), `FormField.tsx`, `ServiceSelector.tsx`, and
  `OptionPills.tsx` live under `src/features/start-project/components/`.
  If a later module needs the same input styling elsewhere, promoting
  them is a two-minute move — the components have no start-project-
  specific logic baked in.
- **`ServiceSelector` reuses the canonical service data** from
  `@/features/home/data/services` (confirmed via source inspection that
  this — not `src/features/services/data/`— is where the 8 services
  actually live, matching what Module 4B's actual code does regardless
  of what its own handoff's suggested file tree implied). No second
  service list was created.
- **One canonical form model.** `ProjectInquiry` in
  `src/features/start-project/data/inquiry.ts` is the only inquiry type
  in the codebase; `validateInquiry()` and `submitInquiry()` both work
  against it directly.

## 6. Routes

```
/contact          — NEW (was placeholder)
/start-project     — NEW (was placeholder)
```

No route names changed; `src/config/routes.ts` was not modified (it
already pointed `ctaRoute` at `/start-project` and listed `/contact` in
`primaryNav` — nothing needed updating there).

## 7. Shared primitives reused

- `Container`, `TechnicalLabel`, `AccentLine`, `Divider`, `SubtleGrid` —
  `src/components/ui/`
- `Reveal`, `SplitHeading` — `src/components/motion/` (via the existing
  `useGsapContext`/reduced-motion architecture; no new GSAP/ScrollTrigger
  code was written anywhere in this module)
- Numbered-row interaction pattern modeled directly on
  `InsightsList.tsx` (Module 4D), per §6's explicit instruction, adapted
  into a toggleable multi-select rather than copied verbatim
- `siteConfig` / `ctaRoute` from `src/config/`

No `Button` component usage in the end — I initially wrote
`SuccessState`/`ContactCta` against `<Button as={Link} href=...>`, but
`Button`'s prop type (`ButtonHTMLAttributes`) doesn't accept `href`, and
I found no existing precedent for that pattern anywhere in the codebase.
The established pattern (confirmed in `src/features/home/sections/
FinalCta.tsx` and `src/features/about/sections/FinalCta.tsx`) is a
plain styled `<Link>` for CTA buttons — I matched that instead of
inventing a new one.

## 8. Motion implementation

- `Reveal` (direction `up`) staggers every chapter/field/row into view.
- `SplitHeading` drives the Hero and success-state headline word-reveal,
  matching the Hero/About/Services pattern established elsewhere.
- No pinning, no `HorizontalScroller`, no 3D — this page's job is to be
  usable and fast to fill in, not spectacular; §16 explicitly warns
  against forcing every form subsection into a cinematic viewport block.

## 9. Form architecture

- Fully client-side, uncontrolled-by-nothing (all fields are React-
  controlled state in `ProjectForm`).
- `submitInquiry()` (`src/features/start-project/lib/submitInquiry.ts`)
  is the single, explicit boundary where a real backend integration
  should be wired in later — the function signature, the calling code
  in `ProjectForm`, and every UI state below already work against that
  contract. It currently simulates a network delay and resolves
  successfully; the file has an explicit `TODO` comment showing the
  real `fetch()` call that should replace the stub.
- No Supabase, no API route, no server action — per §13/§26.

## 10. Validation / loading / error / success states

- **Validation**: `validateInquiry()` runs on submit (not on every
  keystroke, to avoid nagging errors while typing) and produces
  field-level messages rendered next to each input via `role="alert"`.
  Required: name, valid email, project title, at least one selected
  service, and a message of at least ~20 characters. Company, stage,
  timeline, and budget are explicitly optional (labelled as such).
- **Loading**: while `submitInquiry()` is in flight, the submit button
  is `disabled` and its label changes to "Sending…", preventing
  duplicate submissions.
- **Submission failure**: caught in `ProjectForm`'s `handleSubmit`;
  shows "We couldn't send your message. Please try again." next to the
  submit button. Critically, the `inquiry` state is never cleared on
  failure — nothing the visitor typed is lost. The stub in
  `submitInquiry.ts` only throws if `message` is empty (which
  `validateInquiry` already prevents from reaching submission), so this
  path exists as real, reachable code but isn't naturally triggered in
  the current frontend-only stub — see Known Limitations.
- **Success**: `ProjectForm` calls `onSuccess()`, which
  `StartProjectPageContent` uses to swap the hero+form out for
  `SuccessState` — a real full-viewport confirmation with `<Link>`s
  back to Home, Services, and Projects.

## 11. Responsive behavior

- All new sections use the project's fluid type tokens; no manual
  breakpoint-specific font sizes were introduced.
- `ProjectForm`'s Context/Scope grids are `grid-cols-1` on mobile,
  `sm:grid-cols-2` / `sm:grid-cols-3` up — no fixed pixel widths.
- `ServiceSelector` rows and `OptionPills` wrap naturally
  (`flex-wrap`); nothing overflows horizontally at any width.
- Success-state CTA links wrap with `flex-wrap gap-4`.

I did not have a browser available to visually confirm 390px/768px/1440px
per §18 — see Known Limitations.

## 12. Accessibility

- Real `<form onSubmit>` with `noValidate` (validation is handled in
  JS/UI rather than relying solely on browser-native messages, per §11
  of Module 4E's own instructions).
- Every `TextField`/`TextAreaField` uses a real `<label htmlFor>`
  pairing (via `useId()` when no explicit `id` is passed) plus
  `aria-invalid` and `aria-describedby` wired to the error message.
- `ServiceSelector` rows are real `<button type="button" aria-pressed>`
  elements — keyboard-focusable and togglable with Space/Enter with no
  extra JS needed; grouped under `role="group"` with an `aria-label`.
- `OptionPills` use `role="radiogroup"` / `role="radio"` /
  `aria-checked` since only one value can be active per group but any
  option can be un-set.
- Every error message is `role="alert"`.
- Focus-visible outlines (`focus-visible:outline`) are present on every
  new interactive element (buttons, links), consistent with the
  project's existing `Button` component's own focus treatment.
- Reduced-motion: no new motion system — everything runs through
  `Reveal`/`SplitHeading`, which already read `useGsapContext`'s
  reduced-motion flag and degrade to visible-without-animation
  automatically.

## 13. Verification results

```
npm install       PASS
npm run lint      PASS (0 errors, 0 warnings)
npx tsc --noEmit  FAIL — pre-existing, unrelated to this module: a
                  `LayoutProps` error in src/app/layout.tsx (Next.js's
                  generated route-type augmentation, not present when
                  tsc is run standalone outside `next build`). This
                  same error exists before any Module 4E change and is
                  not something this module introduced or can fix
                  without touching src/app/layout.tsx, which is
                  outside this module's scope.
npm run build     PASS — 28/28 routes generated, including /contact,
                  /start-project, and all previously-existing routes
                  (/, /about, /services + 8 detail pages, /projects + 3
                  case studies, /team, /insights + 5 articles, /motion,
                  /design-system)
npm run dev       NOT RUN — no interactive browser available in this
                  environment
```

## 14. Known limitations

- **I have not visually inspected either page in a browser.** Lint,
  typecheck (aside from the pre-existing unrelated error above), and a
  full production build all pass, but per this module's own §25 I'm
  stating explicitly: no screenshot/browser QA was performed. Field
  spacing, the exact look of the service-selection rows, and mobile
  layout at 390px/768px/1440px are my best judgment against the spec,
  not confirmed renders.
- **The submission failure path is implemented but not naturally
  reachable** with the current stub — `submitInquiry()` only throws on
  an empty message, which client-side validation already blocks from
  reaching it. To manually verify the error-state UI, temporarily throw
  unconditionally inside `submitInquiry()` (there's a comment marking
  where) — the `ProjectForm` catch block, error message, and state
  preservation are all real, tested-by-reading code, just not exercised
  by an actual failing network call, since there is no network call yet.
- **`/contact`'s "Direct email & phone" row is an intentional
  placeholder**, not a bug — no such details exist anywhere in the
  project (`src/config/site.ts` has no email/phone field), and inventing
  one is explicitly forbidden by §12/§24. Whoever owns real business
  contact details should either add them to `site.ts` and have this row
  read from there, or replace the row entirely once they exist.
- **Company field types as optional (`string | undefined`)** on
  `ProjectInquiry`; it's initialized to `""` in `emptyInquiry` so the
  input stays controlled, but if `submitInquiry` is later wired to a
  real API, decide server-side whether an empty string or omitted key
  should be sent for an unfilled optional field.

## 15. Instructions for Module 4F (or whatever comes next)

- **Do not rebuild `/contact` or `/start-project`.** Both are complete
  per this module's scope.
- If backend/email infrastructure arrives, the only file that should
  need to change for `/start-project` to go live for real is
  `src/features/start-project/lib/submitInquiry.ts` — replace the stub
  body with a real `fetch()`/server action per the `TODO` comment
  already in that file. `ProjectForm.tsx` and everything downstream of
  it does not need to change.
- If real contact details (email/phone) become available, add them to
  `src/config/site.ts` (the project's existing single source of truth
  for site-level facts) and update `ContactDetails.tsx` to read from
  there — don't hardcode them directly into the component.
- If a later module needs the same editorial form-field styling
  elsewhere on the site, consider promoting `FormField.tsx` (and
  possibly `OptionPills.tsx`) from `src/features/start-project/
  components/` into `src/components/ui/` at that point — they were kept
  feature-scoped here specifically because that's a shared-design-
  system decision this module didn't have the authority to make
  unilaterally.
