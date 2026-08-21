# MODULE 9N — Team Social Links & Services Media Public Integration Fix

## A. Problems discovered

- **Team social links**: `team_members.social_links` was already validated (`teamMemberSocialLinkSchema`), stored, and normalized into `TeamMember.socialLinks` by `publicTeam.ts` — but no active public Team component rendered it. `TeamFocus`, `TeamSequence`, and `TeamJourney` never referenced `member.socialLinks`.
- **Service media**: `services.media_path` was stored (via `ServiceForm` → `general` bucket) and present on `ServiceRow`, but `publicServices.ts`'s adapter dropped it — `toServiceItem()` never called `getPublicMediaUrl`, so `ServiceItem` had no image field and `ServiceVisual` only ever rendered the procedural SVG mark.

## B. Team social integration

```
team_members.social_links (jsonb, {label, href}[])
  → publicTeam.ts: normalizeSocialLinks() (unchanged logic, now also
    strips javascript:/data:/vbscript: hrefs — spec §29)
  → TeamMember.socialLinks
  → TeamSocialLinks (new: src/features/team/components/TeamSocialLinks.tsx)
  → rendered in TeamFocus (the individual-focus chapter on /team)
```

The CMS has no fixed platform enum (`TeamSocialLinksEditor` is a free-text label/URL repeater), so `TeamSocialLinks` matches the admin-entered `label` case-insensitively against common platform names (LinkedIn, GitHub, Twitter/X, Instagram, Facebook) and falls back to a generic globe/external-link icon for anything else — every link still renders and works, only the icon choice is best-effort for unrecognized labels.

Wired into `TeamFocus` only (not `TeamSequence` or the Home `TeamJourney`), since `TeamFocus`'s per-member detail block is the natural existing slot (name/role/bio + now links) and is already the minimum required surface (`/team`). `TeamSequence`'s large-readout layout and `TeamJourney`'s compact grid cards had no equivalent natural slot without altering their composition, so they were left untouched per the "do not redesign" constraint.

No second social-link field or duplicate normalization was introduced — `TeamSocialLinks` consumes the existing `TeamMember.socialLinks` shape as-is.

## C. Service media integration

```
services.media_path (text, general bucket)
  → publicServices.ts: toServiceItem() now calls
    getPublicMediaUrl("general", row.media_path)
  → ServiceItem.image (new optional field)
  → ServiceVisual (extended: optional `image`/`label` props)
  → Services.tsx (home rail), ServiceProgression (/services),
    ServiceDetailHero (/services/[slug])
```

`ServiceVisual` now renders the CMS image (in the same aspect-[4/3] rounded frame, `object-cover`, via `next/image`) when `image` is passed; otherwise it falls through to the exact original procedural SVG mark for that service's `visual` kind — no behavior change for services without an uploaded image. All three existing consumers were updated identically so `/`, `/services`, and `/services/[slug]` stay visually consistent for the same service.

`getPublicMediaUrl("general", ...)` (the existing Module 9H media helper) is the only URL construction used — no manual Storage URL building, no new bucket.

## D. UI preservation

- No new Team section, no Team card redesign, no change to `TeamSequence`/`TeamJourney`/GSAP/ScrollTrigger/Lenis motion.
- No Services redesign — `ServiceRail`, `ServiceProgression`'s list, and `ServiceDetailHero`'s layout are untouched; only the existing visual slot's contents change (image vs. procedural mark).
- No new icon package installed — `TeamSocialLinks` uses hand-written inline SVGs consistent with the project's existing inline-SVG pattern (`ServiceVisual` itself).
- Existing typography/spacing/border/motion tokens (`Reveal`, `--color-border`, `--color-text-secondary`, `--color-brand`) reused throughout.

## E. Accessibility

- Each social icon is an `<a>` with `aria-label`/`title` set to the admin-entered label, `target="_blank"` + `rel="noopener noreferrer"`, and a visible `focus-visible` outline using the existing brand-color token.
- Empty/no-links case renders nothing (no empty container, no placeholder icons).
- Service images have `alt` text derived from the service label (`"{label} illustration"`); the procedural fallback SVG remains `aria-hidden` as before.

## F. Verification

- **Static audit**: traced `social_links` → `publicTeam.ts` → `TeamMember.socialLinks` → `TeamSocialLinks` → `TeamFocus`, and `media_path` → `publicServices.ts` → `ServiceItem.image` → `ServiceVisual` → all three consumers. `rg` confirms no other component still reads a stale/static source for these fields.
- **Lint**: `npm run lint` — passed, no errors.
- **Typecheck/build**: `npx tsc --noEmit` reports one pre-existing, unrelated error (`LayoutProps` in `src/app/layout.tsx`, a Next.js typed-routes global not available outside the Next build pipeline). `npm run build` — completed successfully (exit 0); all routes compiled, including `/team`, `/services`, `/services/[slug]`. Console warnings during build ("query failed... Unable to load...") are expected Supabase-unreachable fallbacks in this offline environment (`getPublicTeamRows`/`getPublicServiceRows` degrade to `[]` per their existing `try/catch` — spec §16/§19), not errors introduced by this module.
- **Live/browser testing**: not performed — no network access to a live Supabase instance in this environment. This is a static-verification pass only (spec §31).

## G. Remaining work

- Live-data verification (adding real social links / uploading a real Service image and confirming in a browser) is still needed once Supabase network access is available — the code paths are traced and typecheck/build clean, but not exercised against real rows.
