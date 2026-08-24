# Final SEO Pre-Production Checklist (SEO-8)

Practical checklist for the site owner/developer. This does not
repeat the reasoning behind each item — see `MODULE-SEO-8-HANDOFF.md`
and the linked docs for that.

## Before deployment

- [x] Production domain confirmed in code — `siteConfig.url =
      https://6stanza.com`, used consistently by canonical, sitemap,
      robots, Open Graph, Twitter, and JSON-LD. **Not independently
      confirmed that this domain is actually the live deployment
      target** — confirm with whoever controls DNS/hosting.
- [x] Environment variables checked — `.env.local` has the three
      required Supabase values populated (URL, anon key, service role
      key). Confirm the same three are set in the production
      hosting platform (Vercel or equivalent) — this repo's
      `.env.local` never deploys.
- [x] Metadata checked — every public route has a unique title,
      description, canonical, robots directive (see Route Matrix in
      the handoff).
- [x] Sitemap checked — `/sitemap.xml` returns valid XML with all
      static routes; dynamic CMS entries verified in code (same
      memoized reads the real pages use) but not observed with live
      data in this sandbox (Supabase host not reachable here).
- [x] Robots checked — `/robots.txt` returns the correct disallow
      list and sitemap URL.
- [x] Schema checked — JSON-LD present and valid on every intended
      route, absent on every noindex route (verified via running dev
      server + curl, this module).
- [x] Build passes — `npm run build` succeeds (verified this module).
- [x] Lint passes — `npm run lint` is clean (one real error found and
      fixed this module — see handoff §V).
- [x] Typecheck passes — `npx tsc --noEmit` is clean (the
      `LayoutProps` error every prior module flagged as "pre-existing"
      is not a real defect — it's Next.js's generated route-type file,
      which only exists after a build; resolved automatically once
      `npm run build` runs once).
- [x] No broken internal links found in a static repo grep (see
      handoff §T).
- [x] Images load correctly in dev with placeholder/fallback states;
      real CMS images not verifiable in this sandbox.
- [ ] Mobile tested on a real device or emulator — **not available in
      this environment**, carried over from SEO-6.

## Immediately after deployment

- [ ] Homepage accessible at `https://6stanza.com`
- [ ] `https://6stanza.com/sitemap.xml` accessible and contains real
      service/project/insight URLs (not just the 8 static routes seen
      in this sandbox)
- [ ] `https://6stanza.com/robots.txt` accessible
- [ ] View source on `/`, `/about`, a `/services/[slug]` — confirm
      canonical tag matches the real URL visited
- [ ] Search Console property verified (domain or URL-prefix — see
      `docs/seo/search-console.md`)
- [ ] Sitemap submitted in Search Console
- [ ] URL Inspection run on the priority list in
      `docs/seo/search-console.md`

## First week

- [ ] Indexing monitored (Search Console → Pages)
- [ ] Coverage errors checked
- [ ] New pages discovered as expected (all services/projects/
      insights, none extra)
- [ ] Initial queries monitored (Search Console → Performance)

## First month

- [ ] Impressions, clicks, CTR, average position reviewed
- [ ] Top queries and top pages reviewed
- [ ] CTR-opportunity pages identified (`docs/seo/search-console.md`
      Opportunity A)
- [ ] Near-page-1 opportunities identified (Opportunity B)
- [ ] First full report produced from
      `docs/seo/seo-report-template.md`
