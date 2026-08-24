# MODULE-SEO-2-HANDOFF.md

## SEO-2 — Keyword Research, Search Intent & On-Page SEO

Inherits SEO-1's technical foundation unchanged (canonical
infrastructure, root metadata, robots, dynamic sitemap, OG/Twitter
defaults). See `MODULE-SEO-1-HANDOFF.md` for that work — not
re-verified or rebuilt here beyond a compatibility check (still
passes lint/typecheck/build after SEO-2's changes).

---

## Keyword strategy

Full strategy document: **`docs/seo/keyword-map.md`**.

Research method: live web search of real Pakistani competitor
pages/SERPs (Clutch, TechBehemoths, ITProfiles, and individual agency
sites) for each of 6STANZA's eight actual services + "Pakistan", to
observe real commercial search phrasing rather than guessing it.

**No search-volume or keyword-difficulty tool was available in this
sandbox.** Every volume/difficulty figure in the keyword map is marked
"Not verified" rather than invented, per the module's explicit rule
against fabricating metrics.

## Search intent

Classified per the module's four-way framework (navigational /
informational / commercial investigation / transactional). Finding:
6STANZA's eight service pages are overwhelmingly targeting
**commercial investigation** intent (someone comparing providers, not
yet ready to buy) — which matches their existing structure
(capabilities → process → CTA) already built in prior modules. No
structural change was needed to match intent, only title/description
alignment.

## Keyword clusters

Eight clusters (one per real 6STANZA service), each following the
dominant real-world pattern found in research:
**"[service] + company/services/agency + Pakistan"**, plus a small
number of technology-specific variants (e.g. "Next.js development
company Pakistan", "AWS DevOps", "CI/CD services Pakistan"). Full
tables with priority (P1/P2/P3) are in the keyword map.

## Page mapping

Complete primary + secondary page mapping table in the keyword map.
Summary: homepage carries brand + category-level positioning only
(never a keyword dump, per §9); each of the eight service detail
pages targets its own cluster; Projects/About/Team/Insights/Contact/
Start a Project each map to their natural informational or
transactional intent.

---

## Implemented on-page changes

**Titles only** — no hero copy, H1 text, section content, or
cinematic layout was touched (§23 explicitly preserved):

| File | Before | After |
|---|---|---|
| `src/app/(site)/about/page.tsx` | "About" | "About Us — Technology Partner in Pakistan" |
| `src/app/(site)/projects/page.tsx` | "Projects" | "Projects — Case Studies & Selected Work" |
| `src/app/(site)/team/page.tsx` | "Team" | "Meet the Team" |
| `src/app/(site)/insights/page.tsx` | "Insights" | "Insights — Engineering & Technology Articles" |
| `src/app/(site)/contact/page.tsx` | "Contact" | "Contact Us" |
| `src/app/(site)/services/page.tsx` | "Services" | "Technology Services in Pakistan" |
| `src/app/(site)/services/[slug]/page.tsx` | `service.label` verbatim (e.g. "Web Development") | `"${service.label} Services in Pakistan"` composed in code around the CMS label — CMS content itself untouched |

Descriptions were left unchanged everywhere the existing copy was
already accurate, unique, and non-generic — per §20/§28, rewriting
working copy just to insert keywords is explicitly prohibited.

**Internal linking**: added one descriptive link ("See [service] work
in our Projects") next to the existing Start-a-Project CTA on every
service detail page (`src/features/services/sections/
ServiceFinalCta.tsx`) — closes the Services → Projects linking gap
noted in the module spec §15/§16. A full-repo search confirmed no
generic "learn more"/"click here"/"read more" anchors existed anywhere
in the codebase already, so no cleanup was needed there.

**H1 audit (no changes needed)**: every important public page already
has exactly one `<h1>` (via the shared `SplitHeading as="h1"`
pattern) — verified across Home, About, Services (list + detail),
Projects (list + detail), Team, Insights (list + detail), Contact,
and Start a Project. On the service detail page specifically, the H1
renders the plain `service.label` while the new title adds the
"Services in Pakistan" qualifier — same topic, not a contradiction
(§29 consistency check).

---

## Content gaps

Five real informational-intent topics identified during research that
6STANZA has no page/article for yet (full detail + priority in the
keyword map): web development cost in Pakistan, choosing a DevOps
partner, what cloud migration involves, what application security
covers, and what technical SEO is. **None were built in this
module** — explicitly deferred to SEO-4 per scope.

---

## Internal linking changes

See "Implemented on-page changes" above — one link added
(Service detail → Projects). No other internal-linking gaps were
found: Projects, Insights, and the header/footer navigation already
link descriptively to their related sections from prior modules.

## CMS considerations

The service-detail title change reads `service.label` from the live
CMS query (`getPublicServiceDetail`) and composes the SEO qualifier
around it at render time — so if an admin renames a service in the
CMS, the title automatically updates on the next request. No static
duplicate copy of CMS content was introduced anywhere (§24).

---

## Verification

```bash
npx tsc --noEmit   # clean, only the same PRE-EXISTING unrelated error
                     # from SEO-1 (src/app/layout.tsx LayoutProps)
npm run lint         # clean, zero warnings/errors
npm run build         # succeeded
```

Rendered-HTML title checks via `curl` against a running `npm run dev`
instance, all confirmed correct after the change (no title doubling,
canonicals unaffected, `robots.txt` unaffected):

| URL | Rendered `<title>` |
|---|---|
| `/about` | About Us — Technology Partner in Pakistan — 6STANZA |
| `/projects` | Projects — Case Studies & Selected Work — 6STANZA |
| `/team` | Meet the Team — 6STANZA |
| `/insights` | Insights — Engineering & Technology Articles — 6STANZA |
| `/contact` | Contact Us — 6STANZA |
| `/services` | Technology Services in Pakistan — 6STANZA |

`/services/[slug]` title composition was verified in code (reads
`service.label` from the live CMS query and appends the qualifier);
the actual rendered output for a real slug could not be observed in
this sandbox because Supabase is network-blocked here — same
limitation already documented in SEO-1's handoff, not new to this
module.

---

## Known limitations

- No keyword-volume/difficulty tool access — every metric in the
  keyword map is explicitly marked "Not verified" rather than
  fabricated.
- Supabase network access is blocked in this sandbox, so the
  service-detail title's actual rendered output with real CMS data
  could not be directly observed here (code-verified only). Spot-check
  against the live deployment (`https://6stanza.vercel.app/` or
  production).
- Research was based on a snapshot of currently-visible SERPs/
  competitor content (August 2026) — search landscapes shift; revisit
  before a major content push.

---

## Deferred to SEO-3

- Structured data / schema.org (JSON-LD)

## Also explicitly deferred (per module framing)

- Content authority / new articles for identified content gaps —
  **SEO-4**
- Local SEO (dedicated Mardan/KP pages) — **SEO-5**
- Performance optimization — **SEO-6**
