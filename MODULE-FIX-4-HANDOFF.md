# FIX-4 — Insight & Project Cover Images Not Loading (remaining spots)

## Root cause

Same class of bug as FIX-3, in more places:

- **`/insights`** — the previous fix (FIX-3) only wired `coverImage` into
  the article **detail** page hero. The `/insights` list page's
  `FeaturedInsight` component still always rendered its procedural
  gradient/SVG placeholder — `insight.coverImage` existed on the type by
  then, but this component never checked it. (`InsightsList`, the
  numbered text list below it, has no image slot by design — not a bug.)

- **Projects (home + `/projects`)** — a bigger gap: `ProjectItem` (the
  type used by the homepage `Work` section and `/projects`'
  `FeaturedProjects`) had no image field at all. The admin's project
  cover-image upload wrote to `projects.media_path` correctly, but
  `toProjectItem()` in `publicProjects.ts` never read it, so there was no
  `coverImage` to render in the first place — both sections always
  showed their procedural `ProjectDiagram`/`ProjectVisual` SVG
  placeholders. (Note: the project **detail page**'s gallery, a separate
  `project_media` table, already worked correctly — this bug only
  affected the card-level cover image shown on the home and `/projects`
  listing sections.)

## Fix

Reused the same `getPublicMediaUrl()` pattern already used everywhere
else (Team, Insights). Real image renders when present; the existing
procedural placeholder still renders when it doesn't — no section ever
shows a broken image icon or empty box.

1. **`src/features/insights/sections/FeaturedInsight.tsx`** — now renders
   `insight.coverImage` (already available on the type since FIX-3) as
   the real image, falling back to the original gradient/SVG placeholder.

2. **`src/features/home/data/projects.ts`** — added `coverImage?: string`
   to the `ProjectItem` type.

3. **`src/features/projects/data/publicProjects.ts`** — `toProjectItem()`
   now maps `row.media_path` through `getPublicMediaUrl("projects", ...)`
   into `coverImage`.

4. **`src/features/home/sections/Work.tsx`** (homepage Projects section) —
   renders `project.coverImage` when present, falls back to the existing
   `ProjectDiagram` placeholder otherwise.

5. **`src/features/projects/sections/FeaturedProjects.tsx`** (`/projects`
   page) — same fix, falls back to the existing `ProjectVisual`
   placeholder.

## Verification

```
npm run lint       — ran, 0 errors
npx tsc --noEmit   — ran, 0 errors
npm run build      — ran, production build succeeds, all routes compile
Browser check      — NOT RUN — no browser available in this sandbox.
                      Please confirm: home Projects section, /projects,
                      and /insights all show the real uploaded image
                      where one exists, and the original placeholder
                      visual (not a broken icon) where one doesn't.
```

## Files changed

- `src/features/insights/sections/FeaturedInsight.tsx`
- `src/features/home/data/projects.ts`
- `src/features/projects/data/publicProjects.ts`
- `src/features/home/sections/Work.tsx`
- `src/features/projects/sections/FeaturedProjects.tsx`

## Known limitation

If a project or insight has no uploaded cover image (`media_path` is
`NULL`), the original procedural placeholder still shows — that's
intentional, not a bug. The Al-Burhan project seeded earlier has no
`media_path` set, so it will show its placeholder until an image is
uploaded via the admin.
