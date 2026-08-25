# FIX-2 — Admin Header Mobile Responsiveness

## 1. Root Cause

`AdminNav.tsx` rendered its brand mark, 7 nav links, the display name, and
`LogoutButton` all inside a single `flex items-center gap-6` row with no wrap
and no responsive collapse at any breakpoint. Below roughly 900–1000px there
simply wasn't enough horizontal space — links got crushed together, ran past
the container edge, and/or collided with the brand mark on the left. There
was no mobile menu pattern in this component at all.

The public marketing header (`src/components/layout/Header.tsx`) already
solves this exact problem with an established pattern: `MenuTrigger`
(`components/ui/nav/NavPrimitives.tsx`) + a `mobileOpen` boolean state + a
slide-down panel gated at the `md:` breakpoint. FIX-2 applies that same
pattern to `AdminNav`, reusing the existing primitive rather than inventing
a second mobile-nav implementation.

## 2. Files Changed

Only one file modified:

- **`src/features/admin/components/AdminNav.tsx`** — converted to a client
  component (`"use state"` → local `mobileOpen` state), same links and
  `LogoutButton` as before, restructured into:
  - a persistent top row: brand mark + "Admin" label (left), full nav row
    hidden below `md:` / shown at `md:` and up (right)
  - a `MenuTrigger` hamburger button, shown only below `md:`
  - a collapsible panel below the header, shown only when `mobileOpen` is
    true and only below `md:`, listing all 7 admin links plus the display
    name and `LogoutButton`, each link/button sized to a `min-h-[44px]` tap
    target

No other file was touched — `AdminLayout` (`src/app/admin/layout.tsx`),
`LogoutButton`, `MenuTrigger`, the public `Header`, and all CMS/auth logic
are unchanged.

## 3. Responsive Behavior

**320–430px:** brand mark + "Admin" label on the left, a single 40×40px
hamburger button on the right — nothing else in the top row, so no collision
is possible. Tapping the hamburger reveals a full-width panel below the
header listing all 7 links, the "← Homepage" link, the admin's display name,
and the sign-out button, each with a ≥44px tap target, stacked vertically —
no horizontal scrolling since everything is a full-width column. The panel
scrolls internally (`overflow-y-auto`, capped at the viewport height below
the header) if content ever exceeds the visible height, matching the same
guard already present in the public header's mobile panel.

**Tablet (between mobile and `md`, i.e. up to ~768px depending on Tailwind's
default `md` breakpoint):** same collapsed behavior as mobile until the `md:`
breakpoint is reached, at which point it switches to the full desktop row.

**Desktop (1024px+):** identical markup and styling to the pre-FIX-2 version
— same links, same order, same spacing (`gap-6`), same `LogoutButton`. The
only structural difference is that row is now wrapped in `hidden md:flex`
instead of being unconditionally rendered, which has no visible effect at
desktop widths.

## 4. Verification

```
npm run lint       — ran, 0 errors
npx tsc --noEmit   — ran, 0 errors
npm run build      — ran, production build succeeds, all admin routes compile
npm run dev / browser check at 320–430px and 1024–1920px
                    — NOT RUN — no browser available in this sandbox to
                      visually confirm rendered layout at each breakpoint.
                      Please spot-check /admin in real devtools device
                      widths before considering FIX-2 fully closed,
                      particularly the panel's open/close and scroll
                      behavior.
```

## 5. Scope Confirmation

- CMS/backend logic — not changed.
- Authentication/logout logic — not changed (`LogoutButton` reused as-is,
  `signOutAction` untouched).
- Public cinematic header (`Header.tsx`) — not changed; only its existing
  `MenuTrigger` primitive was reused, unmodified, in the admin component.
- Desktop admin behavior — preserved; the `md:flex` row is byte-for-byte
  the same links/order/spacing as before.

## 6. Changed/New Files

- `src/features/admin/components/AdminNav.tsx` (modified)
