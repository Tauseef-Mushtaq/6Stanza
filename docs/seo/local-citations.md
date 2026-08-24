# 6STANZA — Local Citation Opportunities (SEO-7)

No listing below is claimed to currently exist for 6STANZA. Every row
is a researched **opportunity**, evaluated against 6STANZA's actual,
verified business facts (Pakistan-based, digital/remote-first, no
public address — see `docs/seo/local-seo-roadmap.md`). Nothing here
was submitted, claimed, or verified as live from this coding
environment.

| Platform | Purpose | Eligibility | Priority | Status | URL | Notes |
|---|---|---|---|---|---|---|
| Google Business Profile | Local/map visibility, direct-contact surfacing | **Not verified** — current GBP policy requires real in-person customer contact or a defined service area with an eligible address; neither is established for 6STANZA in this codebase | P2 (conditional) | Not verified | https://business.google.com | Do not attempt to create until 6STANZA's operators independently confirm eligibility (see roadmap §Google Business Profile status). Creating a listing without meeting the requirement risks suspension and public credibility damage. |
| Clutch | B2B software/services agency directory; referenced during SEO-2's own competitor research as an active category for comparable Pakistani tech companies | Likely eligible — profile-based, does not require a public street address | P2 | Not verified | https://clutch.co | Requires real client reviews to be effective; 6STANZA has no verified review infrastructure yet (see roadmap §Review strategy) — listing without reviews still provides a legitimate company profile/backlink, but value is limited until reviews exist. |
| TechBehemoths | Tech company directory; also referenced during SEO-2 competitor research | Likely eligible | P3 | Not verified | https://techbehemoths.com | Same review caveat as Clutch. |
| GoodFirms | Software/IT services directory | Likely eligible | P3 | Not verified | https://www.goodfirms.co | Not independently researched in depth this module — flagged as a candidate, not confirmed. |
| Pakistan Software Houses Association (P@SHA) | National industry body for Pakistan's software/IT export sector | **Not verified** — membership requirements (company registration, dues, etc.) were not researched in this module | P2 | Not verified | https://pasha.org.pk | If 6STANZA is a registered Pakistani software company, membership is a legitimate, non-spammy citation and industry-credibility signal. Confirm actual eligibility/registration status before pursuing — not assumed here. |
| LinkedIn Company Page | Professional/company profile, indirect local + industry signal | Likely eligible for any registered company | P2 | Not verified | https://www.linkedin.com | No `sameAs` URL exists in current structured data (`organizationSchema()` intentionally omits it — no confirmed social profile exists). If a real, actively-maintained LinkedIn company page exists or is created, add its URL to `sameAs` at that point — not before, and not invented here. |
| Crunchbase | Company/industry profile | Likely eligible | P3 | Not verified | https://www.crunchbase.com | Lower priority — more relevant to funding/startup visibility than local search. |

## Explicitly avoided

- Generic "submit your business to 500 directories" services and
  low-quality link-building networks.
- Any directory that would require inventing a physical address,
  hours, or reviews to complete a listing.
- Duplicate/near-duplicate business listings across multiple
  directories with inconsistent NAP — every listing pursued should
  use the exact same `siteConfig.name` ("6STANZA") and
  `siteConfig.url` (`https://6stanza.com`) the site itself already
  uses consistently.

## How to use this table

Nothing here should be acted on without the business owner's real,
current information (address if one becomes eligible, real phone
line if one is set up, confirmed registration/membership status).
This module's job was to identify legitimate categories worth
pursuing — not to submit anything or fabricate the details a
submission would need.
