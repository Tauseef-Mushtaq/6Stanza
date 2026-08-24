# 6STANZA — SEO Report Template

Copy this section into a new dated entry each reporting period. Every
field must come from a real source (Search Console, an analytics
platform once one exists, or direct code inspection) — use `N/A`,
`Not available`, or `Not verified` rather than a guessed or estimated
number. This template intentionally ships empty; do not pre-fill
example numbers.

See `docs/seo/search-console.md` for where each metric comes from, and
the "Monitoring cadence" section of `MODULE-SEO-5-HANDOFF.md` for when
to run weekly/monthly/quarterly versions of this report.

---

## Reporting period

`YYYY-MM-DD` to `YYYY-MM-DD`

Source: Search Console Performance date range.

## Organic performance

| Metric | This period | Previous period | Change |
|---|---|---|---|
| Clicks | | | |
| Impressions | | | |
| CTR | | | |
| Average position | | | |

Source: Search Console → Performance → Search results (site-wide).

## Top queries

| Query | Clicks | Impressions | CTR | Avg. position |
|---|---|---|---|---|
| | | | | |

Source: Search Console → Performance → Queries tab, sorted by clicks.

## Top landing pages

| Page | Clicks | Impressions | CTR | Avg. position |
|---|---|---|---|---|
| | | | | |

Source: Search Console → Performance → Pages tab, sorted by clicks.

## Biggest gains

Pages/queries with the largest positive change vs. the previous
period. Source: Search Console → Performance, compare mode.

## Biggest declines

Pages/queries with the largest negative change vs. the previous
period — investigate before the next reporting period, don't just log
it. Source: same as above.

## Indexing issues

Pull from Search Console → Indexing → Pages (Coverage report). Use the
classification in `docs/seo/search-console.md` ("Index coverage
classification") to categorize each issue found, and note the
recommended action already documented there rather than re-deriving
it each time.

| URL | Status | Action taken |
|---|---|---|
| | | |

## Search appearance

Note any rich-result types observed in Search Console → Performance →
Search appearance (e.g. breadcrumb trails). Do not assume a rich
result is showing just because the underlying schema exists — only
log what's actually observed here.

## Core Web Vitals status

Pull from Search Console → Core Web Vitals (or PageSpeed
Insights/CrUX directly). This report only records the status found —
optimization work belongs in SEO-6, not here.

| Metric | Status (Good / Needs improvement / Poor) | URLs affected |
|---|---|---|
| LCP | | |
| INP | | |
| CLS | | |

## Content opportunities

Apply the SEO-5 opportunity framework
(`MODULE-SEO-5-HANDOFF.md` §I) to this period's query/page data:

- **Opportunity A (high impressions / low CTR):**
- **Opportunity B (near page 1):**
- **Opportunity C (high CTR / low impressions):**
- **Opportunity D (high impressions / high CTR — what's working):**

Cross-reference against `docs/seo/content-roadmap.md`'s P2/P3 backlog
— an opportunity found here may already be a planned topic, or may
suggest a new one to add.

## Recommended actions

Concrete, specific next steps arising from this period's data —
not general SEO advice repeated every period.

## Completed actions

Actions recommended in the *previous* report that were completed this
period, so progress is traceable across reports.

## Next reporting period

`YYYY-MM-DD` to `YYYY-MM-DD`
