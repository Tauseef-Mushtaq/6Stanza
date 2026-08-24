# 6STANZA — Local SEO Roadmap (SEO-7)

## Current local SEO state

6STANZA has **no verified local/physical-presence footprint** to
build on. What exists in the actual codebase and site content, as of
this module:

- **National-level positioning only.** The About page's Direction
  section (`src/features/about/sections/Direction.tsx`) states, in
  real rendered copy: *"We're based in Pakistan, and that's where our
  work is grounded."* Saudi Arabia, UAE, and "International" are
  explicitly labeled as future direction ("Next" / "Ahead"), not
  current presence.
- **No city, region, or district is claimed anywhere in the
  codebase** — not in copy, not in metadata, not in structured data.
  "Pakistan" (country-level) is the only geography the site itself
  asserts.
- **No street address, postal code, or geo-coordinates exist
  anywhere** in `src/config/site.ts`, structured data, the contact
  page, or the footer. SEO-1 and SEO-3 already established and
  documented this deliberately (see `src/lib/seo/structuredData.ts`'s
  own header comment and `ContactDetails.tsx`'s comment).
- **The only real, working contact channel is WhatsApp Business**
  (`whatsappNumber` in `src/config/site.ts`, a Pakistani mobile
  number: `+92 328 8553087`). There is no published email address and
  no published landline/office phone number anywhere in the codebase.
- **No Google Business Profile, no reviews, no ratings, no
  citations, and no `sameAs` social profile URLs** exist in code —
  `organizationSchema()` in `structuredData.ts` already omits `sameAs`
  with a comment explaining no confirmed profile URL exists.

This module (SEO-7) did not change any of these facts. It documents
them, extends the existing keyword/content architecture with what
they legitimately support, and stops there.

## Business model

**Model C — Digital/remote-first business**, with an important
caveat: the site's own copy ("We're based in Pakistan, and that's
where our work is grounded") is a genuine, code-verified,
country-level operating claim, so the correct framing is closer to
*"national-only" than "no geography at all."* There is not enough
verified information to support **Model A** (no address, no evidence
of a customer-facing office) or a full **Model B** service-area
implementation (service-area businesses still need a defined,
evidence-backed service area and, per current Google Business Profile
guidance, real in-person customer contact — neither is established
here).

This matches SEO-2's own finding, made independently a module ago:
national ("[service] Pakistan") is the real, evidenced opportunity;
city-level intent (including for Mardan specifically) was already
found unverified and deliberately deferred (`docs/seo/keyword-map.md`,
"Location strategy" section, and `docs/seo/content-roadmap.md`,
"Explicitly not planned").

**One flag for review, not changed in this module:** `docs/seo/
keyword-map.md`'s "Brand keywords" table (written during SEO-2)
includes `6STANZA Mardan | Navigational | Homepage / Contact`. Nothing
elsewhere in the codebase — not `siteConfig`, not any page copy, not
any structured data — ties 6STANZA to Mardan specifically; the site's
own content only ever claims Pakistan at large. This row predates
SEO-7 and per this module's own scope rule ("Do NOT rewrite the
existing keyword map"), it was left as-is rather than edited here —
but it's worth a deliberate decision by whoever owns the keyword map:
either it reflects a real fact not yet in the codebase (in which case
it should be sourced/documented properly), or it should be removed as
speculative. Flagged in the handoff (§B) as well.

**A note on this coding environment specifically:** the sandbox this
module ran in resolves to a location in Mardan, Khyber Pakhtunkhwa.
That is a fact about *where this development session happens to be
running*, not about where 6STANZA operates, and it was not used as
evidence anywhere in this module — per the module's own explicit
rule against conflating developer/user location with company
location.

## Geographic strategy

| Level | Status | Action |
|---|---|---|
| National (Pakistan) | **Verified in code**, already implemented (SEO-2 added "Services in Pakistan" title qualifiers; About page states it in body copy) | Primary and only geographic tier actively targeted. No new pages needed — extend existing national content per §Local content strategy below. |
| Regional (Khyber Pakhtunkhwa, or any province) | Not established | Not targeted. No verified service-area or demand evidence. |
| City (Mardan, Peshawar, Islamabad, Lahore, Karachi) | Not established | Not targeted. SEO-2 already researched this and found real local commercial search volume concentrated in Lahore/Karachi/Islamabad — not Mardan — and still correctly deferred all of it as unverified for 6STANZA's actual business. SEO-7 did not create any city-level page, matching that finding. |
| International (Saudi Arabia, UAE) | Explicitly future ambition, not current operation (About page's own copy) | Not targeted. Already correctly deferred by SEO-2; no change. |

**No doorway pages were created.** `/web-development-mardan`,
`/web-development-peshawar`, `/web-development-islamabad`,
`/web-development-lahore`, `/web-development-karachi`, or equivalents
for any other service — none exist, none were added.

## Google Business Profile status

**Google Business Profile eligibility: Not verified — and current
research suggests it is likely not eligible today, on the evidence
this codebase provides.**

Research-verified (web search, current Google Business Profile
guidance, 2026): GBP eligibility requires the business to make **real
in-person contact with customers** during its stated hours — either at
a storefront, or as a service-area business that physically travels to
customers. Google explicitly excludes "online-only businesses... no
in-person customer contact" and lead-generation/referral businesses
from eligibility. A residential or remote address cannot be shown
publicly for a service-area listing; a P.O. box is never acceptable.

Nothing in the current codebase establishes that 6STANZA meets that
bar — no address, no evidence of in-person client meetings, no defined
service area. Since this can't be confirmed either way from the code
alone, this module does not claim ineligibility either — only that
eligibility is unverified and, per the published requirements above,
the current evidence doesn't clear it.

**If 6STANZA's operators can independently confirm real in-person
customer contact** (e.g. client site visits, an office where clients
are received), the following would apply, per current Google guidance:

- Recommended type: **Service-area business** (no public address; a
  defined service area — likely Pakistan-wide or a specific province —
  instead of a radius).
- Primary category consideration: something in the
  "Software Company" / "Website Designer" / "Computer Consultant"
  family — the actual category should be chosen by whoever manages
  the listing, matched to how 6STANZA is really positioned, not
  guessed here.
- Business name: must exactly match `6STANZA` as used consistently
  across the site (`siteConfig.name`) — no keyword-stuffed variants
  ("Best Web Development Company...") in the profile name, which
  violates Google's naming policy and risks suspension.
- NAP consistency: website (`https://6stanza.com`) is fixed; phone
  would need a decision — the WhatsApp Business number is not
  automatically a GBP-eligible phone line (GBP requires a local number
  that can receive calls, not necessarily a WhatsApp-only number) —
  Not verified.
- Hours, photos, verification method, and review strategy: all
  **Not established** — none of this exists in the codebase to audit,
  and none should be invented here.

This module does not create, claim, or configure a Google Business
Profile. No authorized GBP integration exists in this codebase.

## NAP audit

| Field | Status | Where found |
|---|---|---|
| Name | Verified in code | `siteConfig.name` = "6STANZA"; `siteConfig.legalName` = "6STANZA Pvt Ltd" (`src/config/site.ts`) |
| Address | **Not established / not verified** | No street address, city, postal code, or geo-coordinates exist anywhere in the codebase |
| Phone (landline/office) | **Not established** | None exists |
| Phone (WhatsApp Business) | Verified in code | `whatsappNumber` = `923288553087`, used consistently via `whatsappLink()` across the floating WhatsApp button, header, footer, and contact page — one single source, no inconsistent copies found |
| Email | **Not established** | No email address exists anywhere in the codebase |
| Website | Verified in code | `siteConfig.url` = `https://6stanza.com`, used consistently throughout SEO-1/SEO-3's `absoluteUrl()`/metadata system |

No NAP inconsistency was found, because there is no address or
office-phone data anywhere to be inconsistent — the only NAP-adjacent
fact (WhatsApp number) is centralized in one config value and used
consistently everywhere it appears. **No address was invented to
"complete" this audit.**

## Local schema decision

**No LocalBusiness schema (or subtype) was implemented.**

Reasoning: `LocalBusiness` and its subtypes require, at minimum, a
real `address` (or a defined `areaServed` for a service-area
implementation) to be meaningful and non-misleading to search engines
and users. Neither is established with enough confidence in this
codebase to publish as structured fact — inventing one (even a
plausible-sounding city) would violate this module's core rule and
would put schema.org markup ahead of what SEO-3 already deliberately
declined to do. This preserves SEO-3's existing principle exactly.

**One narrow, evidence-backed addition was made instead:** an
`areaServed: "Pakistan"` field was added to `organizationSchema()` in
`src/lib/seo/structuredData.ts`. This is justified because it is not
a new claim — it restates, in structured form, the same country-level
operating fact the site's own visible copy already states (About
page's Direction section: *"We're based in Pakistan"*) and the same
fact SEO-2 already encoded into page titles ("Services in Pakistan").
It does not imply a street address, a storefront, opening hours, or
any LocalBusiness-specific claim — `Organization` (not `LocalBusiness`)
is the correct schema.org type for a country-level service area
without a physical location, per schema.org's own definition of
`areaServed` as applicable to `Organization`/`Service`, not exclusive
to `LocalBusiness`.

## Contact-page changes

None. `/contact` (`src/app/(site)/contact/page.tsx`,
`ContactDetails.tsx`) already correctly presents only what's real: the
project-intake form and the WhatsApp Business link. It does not
imply an address or office phone that doesn't exist, and already
carries a plain `WebPage` schema (not `ContactPage`/`LocalBusiness`) —
exactly matching this module's own guidance. No change was needed or
made.

## Footer/sitewide changes

None. The footer (`src/components/layout/Footer.tsx`) already
contains only `siteConfig.name`, `siteConfig.tagline`, primary nav,
the WhatsApp link, and the legal copyright line — no geographic
keyword stuffing ("Best Web Development Company in Mardan") exists
anywhere in it, and none was added.

## Local content strategy

Extended `docs/seo/content-roadmap.md` with a new **SEO-7 — Local/
National Content** section (P2/P3 only — no P1 added without evidence
of ranking opportunity beyond what SEO-4 already validated). All
proposed topics are **national-Pakistan-level**, matching the only
verified geography, not city-specific:

- Technology decision-making challenges for Pakistani businesses (P2)
- Cloud adoption considerations for Pakistani SMEs (P2)
- Cybersecurity basics for Pakistani businesses (P2)
- Working with a remote/distributed technology partner — what to
  expect (P3) — directly addresses 6STANZA's actual (digital-first,
  no storefront) business model, which is itself a legitimate,
  differentiating angle rather than a gap to hide.
- Software procurement considerations for the Pakistani market (P3)

Every topic above still requires the same research-then-brief process
`docs/seo/content-roadmap.md` already mandates before any is drafted —
none were written in this module; this is a backlog addition only,
same as every existing P2/P3 row.

**Explicitly not added:** any city-specific article ("Web Development
in Mardan", "Best SEO Company in Peshawar," etc.) — no verified local
demand or unique local content exists to justify one.

## Citation opportunities

See `docs/seo/local-citations.md` (new file). Summary: legitimate,
research-identified categories only (Google Business Profile —
pending eligibility confirmation; established Pakistani/South-Asian
tech-industry and B2B directories; professional/industry
organizations). No listing is claimed to currently exist for
6STANZA — every row is `Not verified` / a documented opportunity, not
a confirmed presence. No spam directories, link farms, or paid
low-quality networks are included.

## Review strategy

No real review/testimonial infrastructure exists in the codebase
today (no CMS table, no display component, no schema).
`aggregateRating`/`Review` structured data was **not** added — SEO-3
already deliberately avoided this, and no new evidence changes that.
If 6STANZA later builds a real testimonial/review system (CMS table +
verified customer submissions), that would be a future module's
scope: wire the review data into `structuredData.ts`'s existing
pattern (only real counts/ratings, never seeded/invented ones), not
this one's.

## Internal linking

No new local internal-linking paths were added, because no new local
page exists to link to or from. The existing content graph (Insight →
Service → Project → Start Project, from SEO-4/SEO-5) is unchanged and
was not touched.

## P1 actions

- None identified this module. There is no verified local-business
  gap urgent enough to outrank SEO-6's own carried-forward P1s
  (mobile Lighthouse pass; confirming the actual LCP element per
  route) or SEO-4's content backlog.

## P2 actions

- Resolve the `6STANZA Mardan` keyword-map discrepancy (§Business
  model above) — either source it properly or remove it.
- Draft the national-Pakistan content topics added to
  `docs/seo/content-roadmap.md` (Technology decision-making
  challenges, Cloud adoption for SMEs, Cybersecurity basics), each
  through the existing research → brief → draft process.
- If 6STANZA's operators can confirm real in-person customer contact
  and a defined service area, revisit Google Business Profile
  eligibility with that confirmation in hand (not before).

## P3 actions

- Working with a remote/distributed technology partner (content
  topic).
- Software procurement considerations for the Pakistani market
  (content topic).
- Re-evaluate city-level intent (Lahore/Karachi/Islamabad, not
  Mardan — per SEO-2's own research) only if/when 6STANZA has a real,
  verifiable service presence in one of those cities.
- Citation-building for the categories listed in
  `docs/seo/local-citations.md`, once GBP eligibility (or an
  equivalent verified business-presence fact) is resolved.

## Deferred items

- Any and all city-level landing pages.
- LocalBusiness/subtype schema (any form).
- Google Maps embed.
- Google Business Profile creation/claiming/verification.
- International (Saudi Arabia/UAE) local SEO.
- Review/testimonial structured data.
- hreflang / country-specific duplicate pages.
