# 6STANZA — Keyword Strategy & Page Mapping (SEO-2)

Research method: web search of live SERPs/competitor pages for each
service + Pakistan, read against 6STANZA's actual services (§4 of the
knowledge base) and actual current business direction (Pakistan-based,
expansion ambition toward Saudi Arabia/UAE — not current offices).

**No search-volume or keyword-difficulty tool was available in this
environment.** Every "Volume" / "Difficulty" cell below is marked
**Not verified** rather than invented, per module rule §26. Priority
is based on relevance/commercial intent observed in real SERPs, not
volume data.

---

## Brand keywords (navigational — no optimization needed beyond SEO-1)

| Keyword | Intent | Target page |
|---|---|---|
| 6STANZA | Navigational | Homepage |
| 6 STANZA | Navigational | Homepage |
| 6STANZA Pakistan | Navigational | Homepage |
| 6STANZA Mardan | Navigational | Homepage / Contact |

These already resolve correctly via SEO-1's root metadata. No further
action.

---

## Service keyword clusters

Each cluster observed the same real-world pattern across competitor
sites (Clutch, TechBehemoths, ITProfiles, and individual agency sites)
during research: **"[service] + company/services/agency + Pakistan"**
is the dominant commercial phrasing actually used, alongside
technology-specific variants (e.g. "Next.js development company
Pakistan", "AWS DevOps", "CI/CD services").

### 1. Web Development

| Keyword | Intent | Volume | Difficulty | Priority |
|---|---|---|---|---|
| web development company Pakistan | Commercial investigation | Not verified | Not verified | P1 |
| website development company Pakistan | Commercial investigation | Not verified | Not verified | P1 |
| custom web development Pakistan | Commercial investigation | Not verified | Not verified | P2 |
| Next.js development company Pakistan | Commercial investigation | Not verified | Not verified | P2 |
| web development agency Pakistan | Commercial investigation | Not verified | Not verified | P2 |
| web development company Mardan | Commercial investigation (local) | Not verified | Not verified | P3 |

**Target page:** `/services/web-development` (or the actual live
service slug for this category). **Secondary:** Homepage (brand +
category mention only, per §9).

### 2. Cloud Computing

| Keyword | Intent | Priority |
|---|---|---|
| cloud computing services Pakistan | Commercial investigation | P1 |
| cloud solutions Pakistan | Commercial investigation | P2 |
| cloud infrastructure Pakistan | Commercial investigation | P2 |
| AWS cloud services Pakistan | Commercial investigation | P2 |
| cloud consulting Pakistan | Commercial investigation | P3 |

Research note: several Pakistani competitors explicitly claim
"Official AWS/Alibaba Cloud Partner" status. **6STANZA does not have
a confirmed cloud-provider partnership in current project data — do
not claim one** (per knowledge base §31/§35).

**Target page:** `/services/cloud-computing`.

### 3. DevOps

| Keyword | Intent | Priority |
|---|---|---|
| DevOps services Pakistan | Commercial investigation | P1 |
| DevOps company Pakistan | Commercial investigation | P1 |
| CI/CD services Pakistan | Commercial investigation | P2 |
| Docker Kubernetes services Pakistan | Commercial investigation | P2 |
| DevOps consulting Pakistan | Commercial investigation | P3 |

Research note: competitor pages consistently break "DevOps" into
concrete sub-capabilities (CI/CD pipelines, IaC, containerization,
monitoring/observability) rather than one generic paragraph — this
matches 6STANZA's actual capability list and supports genuinely useful
on-page content rather than a thin definition.

**Target page:** `/services/devops`.

### 4. Cyber Security

| Keyword | Intent | Priority |
|---|---|---|
| cybersecurity company Pakistan | Commercial investigation | P1 |
| cyber security services Pakistan | Commercial investigation | P1 |
| application security Pakistan | Commercial investigation | P2 |
| web security services Pakistan | Commercial investigation | P2 |

**Do not** add "guaranteed protection" or similar absolute claims —
explicitly warned against in both the module spec and general security
marketing best practice (overclaiming here is a credibility risk).

**Target page:** `/services/cyber-security`.

### 5. Networking

| Keyword | Intent | Priority |
|---|---|---|
| networking services Pakistan | Commercial investigation | P2 |
| network infrastructure Pakistan | Commercial investigation | P2 |
| network solutions Pakistan | Commercial investigation | P3 |

Lower search-interest signal in competitor landscape than the other
seven services (fewer dedicated competitor pages found) — still a
real 6STANZA service, kept as P2/P3 rather than P1.

**Target page:** `/services/networking`.

### 6. Marketing & Advertising

| Keyword | Intent | Priority |
|---|---|---|
| digital marketing agency Pakistan | Commercial investigation | P1 |
| marketing agency Pakistan | Commercial investigation | P2 |
| digital advertising Pakistan | Commercial investigation | P2 |

**Target page:** `/services/marketing-advertising`.

### 7. Video Editing

| Keyword | Intent | Priority |
|---|---|---|
| video editing services Pakistan | Commercial investigation | P2 |
| professional video editing Pakistan | Commercial investigation | P2 |
| video editing company Pakistan | Commercial investigation | P3 |

**Target page:** `/services/video-editing`.

### 8. SEO

| Keyword | Intent | Priority |
|---|---|---|
| SEO services Pakistan | Commercial investigation | P1 |
| SEO company Pakistan | Commercial investigation | P1 |
| SEO agency Pakistan | Commercial investigation | P2 |

**Target page:** `/services/seo`.

*(Note: slugs above are illustrative of the pattern — verify each
against the actual current CMS `slug` field per service before
treating any as literal; SEO-1's dynamic sitemap already sources
these live rather than hardcoding them.)*

---

## Location strategy

- **National intent** ("[service] Pakistan") — P1/P2 across all eight
  service clusters above. This matches 6STANZA's actual current market.
- **Local intent** ("[service] Mardan", "[service] Khyber
  Pakhtunkhwa") — kept at **P3 (future opportunity)**, not implemented
  as dedicated pages. Research found real local search volume is
  concentrated in Lahore/Karachi/Islamabad; Mardan-specific commercial
  search volume for these services is not verified and creating a
  dedicated local page without evidence of real demand would risk
  becoming a thin/doorway page (explicitly prohibited, §19).
- **International (Saudi Arabia / UAE)** — P3. 6STANZA's business
  direction includes expansion ambition toward these markets (not
  current offices — per knowledge base §7), so international keywords
  are documented as a future opportunity only. **No international
  landing pages were created in SEO-2** — that requires actual market
  entry, not just a keyword.

---

## Search intent summary

| Query type | Example | Intent |
|---|---|---|
| Brand | "6STANZA" | Navigational |
| Definitional | "what is DevOps" | Informational |
| Comparative/research | "DevOps company Pakistan" | Commercial investigation |
| Ready-to-act | "hire DevOps company Pakistan" | Transactional |

6STANZA's eight service pages are overwhelmingly targeting
**commercial investigation** intent — someone who already knows they
need the service and is evaluating providers. This matches the
existing page structure (capabilities → process → CTA) already built
in SEO-1/prior modules; no structural change was needed, only title/
description alignment (see "On-page changes" below).

---

## Primary page mapping

| Page | Primary topic | Secondary topics | Intent |
|---|---|---|---|
| Homepage (`/`) | 6STANZA — technology partner | Strategy/Software/Systems/Security/Scalability/Speed | Navigational + commercial |
| Services (`/services`) | Technology services in Pakistan | All 8 service categories | Commercial investigation |
| Web Development (`/services/[slug]`) | Web development services Pakistan | Next.js, custom web apps | Commercial investigation |
| Cloud Computing (`/services/[slug]`) | Cloud computing services Pakistan | AWS/cloud infrastructure | Commercial investigation |
| DevOps (`/services/[slug]`) | DevOps services Pakistan | CI/CD, containers, IaC | Commercial investigation |
| Cyber Security (`/services/[slug]`) | Cybersecurity services Pakistan | Application security | Commercial investigation |
| Networking (`/services/[slug]`) | Networking services Pakistan | Infrastructure | Commercial investigation |
| Marketing (`/services/[slug]`) | Digital marketing agency Pakistan | Advertising | Commercial investigation |
| Video Editing (`/services/[slug]`) | Video editing services Pakistan | Production | Commercial investigation |
| SEO (`/services/[slug]`) | SEO services/company Pakistan | Search optimization | Commercial investigation |
| Projects (`/projects`) | Case studies / selected work | Real project outcomes | Commercial investigation |
| About (`/about`) | 6STANZA as a technology partner | Team, philosophy, process | Informational + brand trust |
| Team (`/team`) | Who works at 6STANZA | Engineering/design/infra roles | Informational + trust |
| Insights (`/insights`) | Engineering/technology articles | Cloud, DevOps, security topics | Informational |
| Contact (`/contact`) | How to reach 6STANZA | WhatsApp, Start a Project | Transactional |
| Start a Project (`/start-project`) | Project intake | Budget/timeline/services | Transactional |

## Secondary page mapping

- Individual **Insights articles** may rank for the specific
  informational query their content actually answers (see "Content
  gaps" below for topics with no article yet).
- Individual **Project case studies** may rank for a niche combination
  of technology + industry, when that real information exists in the
  CMS record (never fabricated per §16).

---

## Content gaps (deferred to SEO-4 per module scope — NOT built now)

These are genuine informational-intent topics with commercial
investigation adjacency, observed as real, frequently-covered
questions on competitor/industry sites during research, that 6STANZA
currently has no dedicated page/article for:

1. How much does web development cost in Pakistan? (P1 — very
   commonly answered by competitors, e.g. PKR ranges cited in
   research; 6STANZA has no equivalent published content)
2. How to choose a DevOps company/partner (P2)
3. What does cloud migration actually involve? (P2)
4. What does application-level cybersecurity include? (P2)
5. What is technical SEO, and why does it matter before content SEO?
   (P3 — meta, but genuinely useful given 6STANZA's own SEO-1/SEO-2
   work could inform this)

No pages or articles for these were created in this module — flagged
for SEO-4 content strategy as instructed.

---

## On-page changes implemented in SEO-2

All changes below are **title/description/internal-link only** — no
copy, hero text, H1 content, or cinematic layout was touched (§23).

| File | Change |
|---|---|
| `src/app/(site)/about/page.tsx` | Title: "About" → "About Us — Technology Partner in Pakistan" |
| `src/app/(site)/projects/page.tsx` | Title: "Projects" → "Projects — Case Studies & Selected Work" |
| `src/app/(site)/team/page.tsx` | Title: "Team" → "Meet the Team" |
| `src/app/(site)/insights/page.tsx` | Title: "Insights" → "Insights — Engineering & Technology Articles" |
| `src/app/(site)/contact/page.tsx` | Title: "Contact" → "Contact Us" |
| `src/app/(site)/services/page.tsx` | Title: "Services" → "Technology Services in Pakistan" |
| `src/app/(site)/services/[slug]/page.tsx` | Title/OG/Twitter now compose `"${service.label} Services in Pakistan"` around the CMS `label` field (e.g. "Web Development" → "Web Development Services in Pakistan"), matching the dominant real-world search pattern found in research. CMS content itself untouched; the H1 still renders the plain `service.label` — same topic, title just adds the qualifier a searcher actually types (§29 consistency). |
| `src/features/services/sections/ServiceFinalCta.tsx` | Added one descriptive internal link ("See [service] work in our Projects") next to the existing Start-a-Project CTA on every service detail page — closes the §15/§16 internal-linking gap between Services and Projects. No generic "learn more"/"click here" anchors existed anywhere in the codebase already (verified via full-repo search). |

Descriptions were **not** changed on pages where the existing
description already accurately, uniquely, and naturally represented
the page (about, projects, team, insights, contact, services list) —
rewriting working, accurate, non-generic copy just to insert keywords
would violate §20/§28.

---

## Verification (see MODULE-SEO-2-HANDOFF.md for full command output)

`title` ↔ `H1` ↔ `canonical` ↔ sitemap URL consistency was checked for
every page touched in this module — none of the title changes
contradict the existing H1 or introduce a new/different canonical
path.

---

## Deferred (per module scope)

- Structured data / schema.org — **SEO-3**
- Article/content-gap authoring (§18 gaps above) — **SEO-4**
- Search Console / measurement — **SEO-5**
- Performance optimization — **SEO-6**
- Local SEO (Mardan/KP-specific pages) — **SEO-7** *(module numbering updated since this was first written — see `docs/seo/search-console.md` for SEO-5's actual scope)*

---

## SEO-5 addendum — comparing this map against real Search Console data

This file records **planned/target** keywords from SERP research —
not actual Google query data (no volume/difficulty tool was available
during SEO-2, and still isn't). Once a verified Search Console
property has real Performance data, compare it against this file
rather than replacing it: see "Keyword map compatibility" in
`docs/seo/search-console.md` for the exact workflow. This map is the
plan; Search Console's Queries report is the reality-check.

---

## SEO-7 — Local SEO

Appended, not rewritten (per module scope). See
`docs/seo/local-seo-roadmap.md` for full reasoning — this section
only records the keyword-specific findings.

| Query | Geography | Intent | Related service | Priority | Evidence/status | Recommended page | Notes |
|---|---|---|---|---|---|---|---|
| [service] company Pakistan | National | Commercial investigation | All 8 service clusters | P1/P2 (already covered above, SEO-2) | Verified opportunity — matches site's own verified national positioning | Existing `/services/[slug]` pages | No change; carried forward as-is. |
| technology partner Pakistan | National | Commercial investigation | Homepage/About | P2 | Research candidate | Homepage, About | Not previously captured in the SEO-2 map; matches the site's own tagline language ("Technology partner for Strategy, Software & Systems"). |
| remote software development team Pakistan | National | Commercial investigation | Web Development, DevOps | P3 | Research candidate | Homepage or a future content piece | Matches 6STANZA's actual digital/remote-first model — a differentiator, not a gap. |
| [service] company Mardan | City | Commercial investigation | — | P3 (unchanged from SEO-2) | **Not verified** — SEO-2 already found real local commercial volume concentrated in Lahore/Karachi/Islamabad, not Mardan | Not recommended | No dedicated page. Confirms SEO-2's existing finding rather than reopening it. |
| [service] company Lahore / Karachi / Islamabad | City | Commercial investigation | — | P3 | Research candidate (not verified for 6STANZA specifically — no service-area evidence) | Not recommended without verified service presence | Listed for completeness of research, not as a plan. |
| web development company Saudi Arabia / UAE | International | Commercial investigation | — | P3 | Not verified — explicitly future ambition per About page copy, not current operation | Not recommended | Unchanged from SEO-2's own finding. |

**Discrepancy flagged, not corrected here (see module scope rule
above and `docs/seo/local-seo-roadmap.md` §Business model):** the
existing "Brand keywords" table above this section lists `6STANZA
Mardan` as a navigational keyword. No other fact anywhere in the
codebase (config, copy, or structured data) ties 6STANZA to Mardan
specifically — only to Pakistan nationally. Recommend the keyword map
owner either source this properly or remove it in a future pass.
