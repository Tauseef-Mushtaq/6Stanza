# FIX-1 — Global Form Input Contrast & Dark-Mode Visibility

## Root cause

`src/app/globals.css` defines a `@media (prefers-color-scheme: dark)` block that
overrides `--color-background`, `--color-foreground`, `--color-muted`, and
`--color-border` — but it never touched `--color-surface`,
`--color-surface-elevated`, or `--color-border-subtle`. Those three stayed
hardcoded to light values (`var(--stz-white)`, `#ffffff`) in every theme.

Meanwhile `--color-text-primary: var(--color-foreground)` **does** flip in dark
mode, because CSS custom properties resolve their `var()` references live —
not at the point they were first declared.

The shared form-control primitive used by every admin CMS form
(`src/components/ui/form/Field.tsx` → `Input` / `Textarea` / `Select`) is
styled as:

```ts
background: var(--color-surface);
color: var(--color-text-primary);
```

So in dark mode: `--color-text-primary` turned white, `--color-surface`
stayed white — white text on a white field. Same value typed, zero contrast.

The public-facing `AuthField.tsx` and `start-project/FormField.tsx` fields
were **not** affected by this specific bug — they use
`background: transparent; color: inherit`, both of which correctly track the
already-flipping `--color-background` / `--color-foreground` pair.

A secondary, separate risk was also present: no `color-scheme` was declared
anywhere, so native browser chrome (autofill background, select popup,
scrollbars) had no signal to match the app's theme; and no `-webkit-autofill`
override existed, so Chrome/Safari autofill can paint its own opaque
background/text over any field regardless of our CSS.

## Scope inspected

- `AuthField.tsx` (login, signup, forgot-password, reset-password)
- `start-project/FormField.tsx` (Start a Project — text/email/textarea)
- `components/ui/form/Field.tsx` (Input, Textarea, Select, Checkbox, Radio —
  consumed by every admin CMS form: services, projects, team, insights,
  inquiries)
- `globals.css` token definitions and dark-mode media query
- Full-repo grep for hardcoded `text-white` / `text-black` / `bg-white` /
  `bg-black` on form elements — only one unrelated hit
  (`FaqChatbot.tsx`, a chat bubble button label, not a form field; left
  untouched)

## Solution

**Token-level fix only** — no component or shared-primitive code was changed.
Three additions to `src/app/globals.css`:

1. Extended the existing `@media (prefers-color-scheme: dark)` block to also
   override `--color-surface`, `--color-surface-elevated`, and
   `--color-border-subtle` with dark-appropriate values drawn from the
   existing `--stz-navy-*` primitives (no new color system introduced).
2. Added `color-scheme: light dark;` to `:root` so native control chrome
   (select popups, scrollbars, autofill hint colors) follows the same theme
   the app already renders.
3. Added a global `:-webkit-autofill` override (inset `box-shadow` trick +
   `-webkit-text-fill-color`) so autofilled fields stay on the same
   `--color-surface` / `--color-text-primary` tokens instead of the
   browser's own autofill palette.

## Theme behavior (field tokens, both modes)

| Token | Light | Dark |
|---|---|---|
| `--color-surface` (field bg) | `--stz-white` | `--stz-navy-800` |
| `--color-surface-elevated` | `#ffffff` | `--stz-navy-700` |
| `--color-text-primary` (value text) | `--stz-navy-950` | `--stz-white` |
| `--color-text-muted` (placeholder) | `#8189a0` | `#8189a0` (unchanged — mid-gray reads on both) |
| `--color-border` / `--color-border-subtle` | light-on-light rgba | light-on-dark rgba (already/now flip) |
| `--color-error` | `#d1483f` | unchanged — already sufficient contrast on both surfaces |

`AuthField` / `start-project FormField` continue to use transparent
background + `inherit`, which already tracked `--color-background` /
`--color-foreground` correctly before this fix.

## Autofill

Global `:-webkit-autofill` rule added in `globals.css`, covers `input`,
`textarea`, and `select`, in default/hover/focus states, repainting the
autofilled surface with the same `--color-surface` token via a large inset
`box-shadow` (the only override Chrome/Safari respect) and forcing
`-webkit-text-fill-color` (since `color` alone is ignored on autofilled
fields in WebKit/Blink).

## Verification

```
npm install       — OK, 441 packages
npm run lint       — OK, no errors
npx tsc --noEmit   — 1 pre-existing error, unrelated to this fix:
                     src/app/layout.tsx(68,50): Cannot find name 'LayoutProps'
                     (present before this change; this fix touched only
                     globals.css, no .ts/.tsx files)
npm run build      — OK, production build succeeds; all routes compile,
                     including /services/[slug] and /projects/[slug] as
                     fully dynamic (ƒ), confirming the earlier slug-route
                     fix is unaffected
npm run dev        — NOT RUN — no browser available in this sandbox to
                     visually confirm rendered contrast; token math was
                     verified by hand against both media-query branches
```

## Files changed

- `src/app/globals.css` (only file modified)

## Known limitations

- Not visually verified in an actual browser/OS dark-mode toggle — this
  sandbox has no browser. The fix is a direct, minimal token correction
  addressing the exact mechanism traced above (confirmed via manual
  cascade resolution), but please do the manual check in §24 of the spec
  (type real text into each form in both themes) before considering FIX-1
  fully closed.
- `--color-text-muted` (placeholder color) was left unchanged in dark mode —
  it's a fixed mid-gray that has adequate contrast against both the light
  and new dark surface tokens, so no override was added. If it reads too
  dim in an actual dark-mode test, it's a one-line addition to the same
  media query block.
- Native `<select>` dropdown *popup* appearance (the open list, not the
  closed field) is largely browser/OS-controlled even with `color-scheme`
  set; exact rendering will vary by browser and wasn't touched further.
