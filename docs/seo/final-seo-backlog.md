# Final SEO Backlog (SEO-8)

Genuine remaining work only, cross-referenced against existing
roadmap docs rather than duplicated. See `MODULE-SEO-8-HANDOFF.md`
for full evidence behind each item.

## P0 — Blocking

None found. No public page is accidentally noindexed, no broken
canonical, no invalid sitemap/robots, no severe broken route, no
private content exposed.

## P1 — Important

1. **Run a real mobile + desktop Lighthouse/PageSpeed pass** against
   the deployed production URL for `/`, a `/services/[slug]`, a
   `/projects/[slug]`, `/insights/[slug]` — carried over unresolved
   from SEO-6. Not possible from this sandbox (no live production URL
   reachable). Use the results to confirm/assign `priority` on
   whichever element the report names as the actual LCP element —
   none should be added speculatively.
2. **Verify the dynamic sitemap and JSON-LD schema against live CMS
   data** on a real deployment with Supabase reachable — this
   sandbox's build/dev-server both gracefully degrade to
   static-only/error states because
   `hmdaorajqckzuuywxlmg.supabase.co` isn't in this environment's
   network allowlist (confirmed directly this module, not assumed).
   Code paths are verified; live output with real rows is not.
3. **Owner decision needed: `6STANZA Mardan` keyword-map entry**
   (`docs/seo/keyword-map.md` line 23). No supporting evidence exists
   anywhere in the codebase (re-confirmed this module — flagged
   unresolved since SEO-7). Either source real evidence or remove the
   row.

## P2 — Improvement

1. **`select("*")` over-fetch pattern** — present not just in
   `insights` (SEO-6's original finding) but also in `projects`,
   `contact_inquiries`, `project_inquiries`, `team_members`,
   `services`, `profiles`, and `project_media` repositories (confirmed
   by repo-wide grep this module). Highest-value target remains
   `insights` (large `content` jsonb body fetched on every list read).
   Not fixed in SEO-8 — this is a data-layer refactor across many
   files, and fixing it blind without a live environment to verify
   list/detail/metadata output against was correctly out of scope for
   an audit-first module.
2. **`ProjectItem`/`Insight` cover-image fields** — still absent from
   the public data layer (documented since SEO-1, unchanged through
   SEO-7). OG images and Article/CreativeWork schema images still
   fall back to the brand mark. Add a cover-image column + storage
   path once the CMS/media layer work is prioritized.
3. **`updated_at` exposure** — sitemap `lastModified` and schema
   `dateModified` remain omitted (correctly, per SEO-1) because no
   public data layer exposes a real update timestamp yet.
4. **Admin "Related service" field is a plain text input**, not a
   `<select>` of real service slugs (SEO-4 known limitation, still
   true). Functionally correct — slugs that don't resolve render no
   CTA rather than erroring — but a dropdown would be a better editing
   experience.
5. **`NEXT_PUBLIC_SITE_URL`** (auth redirects) and **`siteConfig.url`**
   (everything SEO) remain two different sources of truth for "the
   site's URL" (flagged, not touched, since SEO-5). The SEO-facing one
   is confirmed correct; unifying them is a small future cleanup, not
   an SEO defect.
6. Deeper internal linking — `Article → Project` connections (SEO-4)
   and `Service → Insight` coverage for the 3 services with no related
   article yet (networking, marketing, video-editing) — will fill in
   naturally as `docs/seo/content-roadmap.md`'s P2/P3 backlog is
   executed.

## P3 — Future

1. Formal Core Web Vitals field-data collection once an analytics/RUM
   provider is chosen (SEO-5 explicitly deferred analytics; still not
   implemented, confirmed this module — no `gtag`/`GTM-`/analytics
   code found in repo).
2. Broader content clusters beyond the 5 P1 articles already published
   — full backlog in `docs/seo/content-roadmap.md`.
3. International (Saudi Arabia/UAE) SEO / hreflang — deferred per
   SEO-7, still not started, correctly so (no real international
   operating presence in the codebase).
4. Richer local presence (Google Business Profile, `LocalBusiness`
   schema, city pages) — deferred per SEO-7's own findings
   (`docs/seo/local-seo-roadmap.md`); only pursue if the business
   owner independently confirms GBP eligibility and a real address.
5. `manifest.json` / PWA install metadata — noted as out-of-scope
   since SEO-1, still not built, not a crawl/index blocker.
6. www/non-www + HTTPS redirect enforcement at the DNS/hosting layer —
   outside this codebase's reach since SEO-1; confirm with whoever
   controls DNS.
