# 6STANZA — Content Roadmap (SEO-4)

This is the long-term content plan for 6STANZA's Insights section. It
extends the keyword/intent work from SEO-2 (`docs/seo/keyword-map.md`
"Content gaps") into a prioritized backlog with real topic clusters,
not a flat list of blog ideas.

No search-volume or keyword-difficulty tool is available in this
environment. Every priority below is based on commercial relevance,
relationship to an actual 6STANZA service page, and realistic ranking
opportunity observed in live SERPs during SEO-2 research — never
invented volume figures (module spec §2/§26).

---

## Topic clusters

Each cluster centers on one of 6STANZA's eight services and links
articles → service page → projects → start a project, per spec §16.

```text
WEB DEVELOPMENT
├── Web development cost in Pakistan            [P1 — published]
├── How to choose a web development company     [P2]
├── Custom web application development           [P2]
├── Next.js development — when it's the right choice   [P3]
└── Web application architecture basics           [P3]
        ↓
   /services/web-development → /projects → /start-project

CLOUD
├── What cloud migration involves                [P1 — published]
├── Cloud cost optimization basics                [P2]
├── Choosing a cloud provider for a Pakistani business   [P3]
        ↓
   /services/cloud-computing

DEVOPS
├── How to choose a DevOps partner                [P1 — published]
├── CI/CD explained for non-engineers             [P2]
├── Infrastructure as Code — what it actually means      [P3]
        ↓
   /services/devops

CYBER SECURITY
├── What application security covers              [P1 — published]
├── Common web application vulnerabilities (OWASP-aligned)  [P2]
├── Security basics for a small business website  [P3]
        ↓
   /services/cyber-security

SEO
├── What technical SEO is                         [P1 — published]
├── On-page SEO checklist                          [P2]
├── Local SEO for Pakistani businesses — when it's worth it  [P3]
        ↓
   /services/seo

NETWORKING
├── Networking basics for growing businesses       [P3]
        ↓
   /services/networking

MARKETING & ADVERTISING
├── Choosing a digital marketing agency in Pakistan   [P2]
├── Marketing budget basics for small businesses   [P3]
        ↓
   /services/marketing

VIDEO EDITING
├── What to prepare before hiring a video editor   [P3]
        ↓
   /services/video-editing
```

---

## P1 — Published this module

| Title | Slug | Primary keyword | Cluster | Target service |
|---|---|---|---|---|
| How Much Does Web Development Cost in Pakistan? | `web-development-cost-in-pakistan` | web development cost Pakistan | Web Development | `/services/web-development` |
| How to Choose a DevOps Partner | `how-to-choose-a-devops-partner` | how to choose a DevOps partner | DevOps | `/services/devops` |
| What Cloud Migration Actually Involves | `what-cloud-migration-involves` | what does cloud migration involve | Cloud | `/services/cloud-computing` |
| What Application Security Actually Covers | `what-application-security-covers` | what is application security | Cyber Security | `/services/cyber-security` |
| What Is Technical SEO? | `what-is-technical-seo` | what is technical SEO | SEO | `/services/seo` |

All five were in SEO-2's deferred content-gap list and were judged, on
research, to genuinely merit publication now — none were deferred to
P2/P3 (see "Articles intentionally deferred" in the SEO-4 handoff for
the reasoning, kept there rather than duplicated here).

Each links to its related service via the new `related_service_slug`
field (`Insight.relatedServiceSlug`), rendered as a real `<Link>` on
the article page — not body-text mentions (spec §16/§17).

---

## P2 — Next

| Title | Cluster | Notes |
|---|---|---|
| How to choose a web development company | Web Development | Natural companion to the cost article; different intent (evaluating providers vs. budgeting) |
| Custom web application development | Web Development | Deeper technical piece, cornerstone candidate |
| Cloud cost optimization basics | Cloud | Common follow-on question after migration |
| CI/CD explained for non-engineers | DevOps | Supports the DevOps partner article for a less technical reader |
| Common web application vulnerabilities (OWASP-aligned) | Cyber Security | Deeper technical companion to the application security overview |
| On-page SEO checklist | SEO | Complements the technical SEO article; content-side of SEO |
| Choosing a digital marketing agency in Pakistan | Marketing | Same "how to choose a partner" pattern that worked for DevOps |

## P3 — Future opportunities

| Title | Cluster | Notes |
|---|---|---|
| Next.js development — when it's the right choice | Web Development | Technology-specific, narrower audience |
| Web application architecture basics | Web Development | Cornerstone-adjacent, needs real project examples to stay non-generic |
| Choosing a cloud provider for a Pakistani business | Cloud | Needs verified, current provider/pricing research before writing |
| Infrastructure as Code — what it actually means | DevOps | Narrower, more technical audience than the P1 DevOps article |
| Security basics for a small business website | Cyber Security | Different audience (non-technical owner) than the P1 article |
| Local SEO for Pakistani businesses — when it's worth it | SEO | Explicitly NOT dedicated local landing pages (spec §13) — an educational article about whether/when local SEO investment makes sense |
| Networking basics for growing businesses | Networking | Lower research signal in SEO-2; kept P3 |
| Marketing budget basics for small businesses | Marketing | |
| What to prepare before hiring a video editor | Video Editing | Weakest cluster; revisit once other clusters are established |

---

## Cornerstone candidates (future)

Once their supporting-article clusters have at least 2–3 pieces, these
are the strongest candidates for a deeper, cornerstone treatment (spec
§15) that the supporting articles link into:

- **Technical SEO Guide** (extends "What Is Technical SEO?")
- **Cloud Migration Guide** (extends "What Cloud Migration Actually Involves")
- **DevOps Partner Selection Guide** (extends "How to Choose a DevOps Partner")

Not built in SEO-4 — each P1 article is written to stand alone, but
with headings and scope that a future cornerstone piece can expand
without contradicting.

---

## Explicitly not planned

- **Location-specific landing pages** (`web-development-mardan`, etc.)
  — per spec §13 and SEO-2's own location-strategy findings, real
  local commercial search intent for these services is not verified
  for Mardan specifically. Not created; not planned unless real
  business intent and genuinely unique local content emerge.
- **International (Saudi Arabia / UAE) content** — matches SEO-2's
  finding that this is expansion ambition, not a current market;
  revisit at actual market entry, not before.

---

## How this roadmap should be used

Each P2/P3 row is a topic, not a brief. Before writing any of them,
follow the same process this module used: research current SERPs and
questions for that specific topic, write a content brief (see
`MODULE-SEO-4-HANDOFF.md` for the brief template used on the five P1
articles), and only then draft. Do not batch-write P2/P3 articles
without that step — this is the same rule SEO-4 itself was built
under (module spec, "Critical Rule").

---

## SEO-5 addendum — measuring what's here

As of SEO-5, the five P1 articles above are also linked from their
service page's new "Related Insights" section (the reverse of each
article's existing "Related Service" link — see
`MODULE-SEO-5-HANDOFF.md` §M). No P1/P2/P3 priorities changed this
module — SEO-5 is a measurement module, not a content module. Once
Search Console has real query data against these five articles, use
it to validate or revise the P2/P3 backlog above — see "Content ↔
Search Console loop" in `docs/seo/search-console.md`. No queries have
been observed yet, so no backlog item has been added or reprioritized
on that basis.

---

## SEO-7 — Local/national content opportunities

Appended, not rewritten (per module scope). All national-Pakistan
level — no city-specific topic is included, per
`docs/seo/local-seo-roadmap.md`'s geographic strategy.

```text
LOCAL/NATIONAL
├── Technology decision-making challenges for Pakistani businesses  [P2]
├── Cloud adoption considerations for Pakistani SMEs                [P2]
├── Cybersecurity basics for Pakistani businesses                    [P2]
├── Working with a remote/distributed technology partner            [P3]
└── Software procurement considerations for the Pakistani market    [P3]
        ↓
   /services/[relevant service] → /projects → /start-project
```

Each topic still requires the same research → brief → draft process
this roadmap already mandates (see "How this roadmap should be used"
above) before any is written. None were drafted in SEO-7 — this is a
backlog addition only.

**Still explicitly not planned:** city-specific content
(Mardan/Peshawar/Islamabad/Lahore/Karachi-branded articles) and
international (Saudi Arabia/UAE) content — both already covered under
"Explicitly not planned" above; SEO-7 found no new evidence to change
either conclusion.
