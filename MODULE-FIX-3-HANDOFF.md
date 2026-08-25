# FIX-3 — Insight Cover Images Not Loading

## Root cause

Not a broken URL/storage config — the cover image was never wired to the
public site at all.

- `InsightForm.tsx` (admin) already has a working "Cover image" upload
  field that correctly writes to `insights.media_path`.
- But the frontend `Insight` type (`features/insights/data/insights.ts`)
  had no image field, `toInsight()` in `publicInsights.ts` never read
  `row.media_path`, and no component on `/insights` or `/insights/[slug]`
  ever rendered an image. `getPublicMediaUrl()` — the existing helper
  every other CMS media field already goes through (Team's
  `image_path`, Projects' gallery) — was simply never called for
  Insights.

So any image an admin uploaded reached the database correctly and was
never lost — it just had no path back out to the page.

`next.config.ts`'s `images.remotePatterns` (required for `next/image` to
load a Supabase Storage URL) was already correctly configured from an
earlier module — not part of this bug.

## Fix

Three files, same pattern `publicTeam.ts` already uses for
`team_members.image_path`:

1. **`src/features/insights/data/insights.ts`** — added
   `coverImage?: string` to the `Insight` type.
2. **`src/features/insights/data/publicInsights.ts`** — `toInsight()`
   now maps `row.media_path` through the existing
   `getPublicMediaUrl("insights", ...)` helper into `coverImage`.
   `undefined` when no image was ever uploaded — never a fabricated
   placeholder.
3. **`src/features/insights/sections/ArticleHero.tsx`** — renders
   `insight.coverImage` (when present) as a full-bleed background image
   behind the existing hero content, with a gradient overlay back to
   `--stz-navy-950` so title/label text stays readable — matching the
   same "only render if it exists, never break the layout when it
   doesn't" fallback pattern `ProjectGallery.tsx` already uses for its
   optional gallery images.

## Scope

Only the article **detail page** hero (`/insights/[slug]`) now shows the
cover image. The `/insights` list page (`FeaturedInsight`, `InsightsList`
cards) still has no image rendering — it never did, and wasn't part of
what you reported. Let me know if you'd like those wired up too; it's the
same one-line `coverImage` field, just consumed by two more components.

## Verification

```
npm run lint       — ran, 0 errors
npx tsc --noEmit   — ran, 0 errors
npm run build      — ran, production build succeeds, all routes compile
Browser check      — NOT RUN — no browser available in this sandbox.
                      Please confirm visually: open an insight that has
                      a cover image uploaded in admin, and one that
                      doesn't (should show the original plain hero,
                      no broken image icon, no layout shift).
```

## Files changed

- `src/features/insights/data/insights.ts`
- `src/features/insights/data/publicInsights.ts`
- `src/features/insights/sections/ArticleHero.tsx`

## Known limitation

If none of your 5 seeded insights actually have an uploaded cover image
yet (`media_path` is `NULL` for all of them), you won't see any visual
change until you upload one via the admin — the code path is fixed, but
there's nothing to render until an image exists.
