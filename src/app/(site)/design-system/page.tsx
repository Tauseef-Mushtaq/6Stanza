import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section, DarkSection } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { NumberIndicator } from "@/components/ui/NumberIndicator";
import { Divider, Dot, AccentLine, CornerMarker, SectionNumber } from "@/components/ui/Divider";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { Badge } from "@/components/ui/Badge";
import { Card, CardEyebrow, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { FieldGroup, Label, HelperText, ErrorText, Input, Textarea, Select, Checkbox, Radio } from "@/components/ui/form/Field";
import { NavItem, NavGroup, MenuTrigger, SectionIndicator } from "@/components/ui/nav/NavPrimitives";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * SEO-1 — internal design/component showcase route, not a marketing
 * page. `noindex, nofollow` keeps it out of search results even
 * though `robots.txt` also disallows crawling it (SEO-1 §10/§11 —
 * robots.txt alone isn't a reliable de-indexing mechanism, e.g. if
 * this URL is ever linked externally).
 */
export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

const COLOR_GROUPS: { title: string; swatches: { name: string; varName: string; dark?: boolean }[] }[] = [
  {
    title: "Brand",
    swatches: [
      { name: "Brand", varName: "--color-brand" },
      { name: "Brand Strong", varName: "--color-brand-strong" },
      { name: "Brand Soft", varName: "--color-brand-soft" },
      { name: "Accent", varName: "--color-accent", dark: true },
    ],
  },
  {
    title: "Navy",
    swatches: [
      { name: "Navy", varName: "--stz-navy-900", dark: true },
      { name: "Navy Deep", varName: "--stz-navy-950", dark: true },
      { name: "Navy 800", varName: "--stz-navy-800", dark: true },
      { name: "Navy 700", varName: "--stz-navy-700", dark: true },
    ],
  },
  {
    title: "Neutral",
    swatches: [
      { name: "White", varName: "--stz-white" },
      { name: "Black", varName: "--stz-black", dark: true },
      { name: "Surface", varName: "--color-surface" },
      { name: "Border", varName: "--color-border" },
    ],
  },
  {
    title: "Text",
    swatches: [
      { name: "Text Primary", varName: "--color-text-primary", dark: true },
      { name: "Text Secondary", varName: "--color-text-secondary", dark: true },
      { name: "Text Muted", varName: "--color-text-muted", dark: true },
    ],
  },
  {
    title: "State",
    swatches: [
      { name: "Success", varName: "--color-success" },
      { name: "Warning", varName: "--color-warning" },
      { name: "Error", varName: "--color-error" },
    ],
  },
];

const TYPE_SCALE: { label: string; token: string; sample: string }[] = [
  { label: "Hero Display", token: "--text-hero", sample: "6STANZA" },
  { label: "Display", token: "--text-display", sample: "Build without limits" },
  { label: "H1", token: "--text-h1", sample: "Engineering the digital future" },
  { label: "H2", token: "--text-h2", sample: "Strategy. Software. Systems." },
  { label: "H3", token: "--text-h3", sample: "Security & Scalability" },
  { label: "H4", token: "--text-h4", sample: "Selected Work" },
  { label: "Body Large", token: "--text-body-lg", sample: "We partner with ambitious teams to design, build and ship technology that lasts." },
  { label: "Body", token: "--text-body", sample: "A premium technology partner for strategy, software and systems." },
  { label: "Small", token: "--text-small", sample: "Available for new engagements in Q1." },
  { label: "Caption", token: "--text-caption", sample: "Updated August 2026" },
];

const SPACING_TOKENS = [
  "--space-micro",
  "--space-xs",
  "--space-sm",
  "--space-md",
  "--space-lg",
  "--space-xl",
  "--space-2xl",
  "--space-3xl",
  "--space-4xl",
];

const MOTION_DURATIONS = [
  { name: "Instant", token: "--duration-instant" },
  { name: "Fast", token: "--duration-fast" },
  { name: "Normal", token: "--duration-normal" },
  { name: "Slow", token: "--duration-slow" },
  { name: "Cinematic", token: "--duration-cinematic" },
];

const MOTION_EASES = [
  { name: "Standard", token: "--ease-standard" },
  { name: "Smooth", token: "--ease-smooth" },
  { name: "Emphasized", token: "--ease-emphasized" },
  { name: "Cinematic", token: "--ease-cinematic" },
];

function ShowcaseSection({
  index,
  label,
  title,
  description,
  children,
}: {
  index: number;
  label: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="border-t border-[var(--color-border)]" style={{ paddingBlock: "var(--space-3xl)" }}>
      <Container className="flex flex-col gap-10">
        <div className="flex items-start gap-4">
          <SectionNumber value={index} />
          <SectionHeading eyebrow={label} title={title} description={description} className="max-w-2xl" />
        </div>
        {children}
      </Container>
    </Section>
  );
}

export default function DesignSystemPage() {
  return (
    <div>
      {/* HERO / BRAND ------------------------------------------------ */}
      <DarkSection className="relative overflow-hidden">
        <Container className="relative flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <BrandMark size={40} priority />
            <TechnicalLabel style={{ color: "var(--stz-blue-300)" }}>6STANZA — Design System</TechnicalLabel>
          </div>
          <h1
            className="max-w-4xl text-balance font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-display)", lineHeight: "var(--leading-tight)" }}
          >
            Visual language &amp; reusable UI system.
          </h1>
          <p className="max-w-2xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            The foundation every future 6STANZA experience — cinematic homepage, service
            navigation, team, projects — is built on. Module 1 only: no finished pages live
            here, just the system.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="blue">Primary Action</Button>
            <Button variant="outline" style={{ borderColor: "var(--color-border-inverse)", color: "var(--stz-white)" }}>
              Secondary Action
            </Button>
          </div>
        </Container>
      </DarkSection>

      {/* 01 — COLORS --------------------------------------------------- */}
      <ShowcaseSection
        index={1}
        label="Foundations"
        title="Color system"
        description="Semantic tokens layered over brand primitives. Components consume var(--token), never raw hex."
      >
        <div className="flex flex-col gap-10">
          {COLOR_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <TechnicalLabel>{group.title}</TechnicalLabel>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {group.swatches.map((s) => (
                  <div key={s.varName} className="flex flex-col gap-3">
                    <div
                      className="h-20 rounded-[var(--radius-md)]"
                      style={{ background: `var(${s.varName})`, border: "1px solid var(--color-border)" }}
                    />
                    <div className="flex flex-col">
                      <span style={{ fontSize: "var(--text-small)" }}>{s.name}</span>
                      <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
                        {s.varName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 02 — TYPOGRAPHY ------------------------------------------------ */}
      <ShowcaseSection
        index={2}
        label="Foundations"
        title="Typography"
        description="A hierarchy built to stretch from oversized cinematic headlines down to compact technical labels."
      >
        <div className="flex flex-col divide-y divide-[var(--color-border)]">
          {TYPE_SCALE.map((t) => (
            <div key={t.token} className="grid grid-cols-1 gap-2 py-6 md:grid-cols-[10rem_1fr]">
              <div className="flex flex-col">
                <span style={{ fontSize: "var(--text-small)" }}>{t.label}</span>
                <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
                  {t.token}
                </span>
              </div>
              <p
                className="text-balance font-[var(--font-display)] tracking-tight"
                style={{ fontSize: `var(${t.token})`, lineHeight: "var(--leading-tight)" }}
              >
                {t.sample}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-8 pt-4">
          <TechnicalLabel>Technical Label / Eyebrow Style</TechnicalLabel>
          <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)" }}>
            NAVIGATION ITEM
          </span>
        </div>
      </ShowcaseSection>

      {/* 03 — SPACING --------------------------------------------------- */}
      <ShowcaseSection
        index={3}
        label="Foundations"
        title="Spacing scale"
        description="Semantic spacing tokens, from micro UI gaps up to full section rhythm."
      >
        <div className="flex flex-col gap-3">
          {SPACING_TOKENS.map((token) => (
            <div key={token} className="flex items-center gap-4">
              <span className="w-32 font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
                {token}
              </span>
              <div className="h-3 rounded-full" style={{ width: `var(${token})`, background: "var(--color-brand)" }} />
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 04 — CONTAINERS & GRID ------------------------------------------ */}
      <ShowcaseSection
        index={4}
        label="Layout"
        title="Containers & grid"
        description="Layout primitives that support editorial, asymmetric compositions — not just a centered 3-column grid."
      >
        <div className="flex flex-col gap-6">
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-4">
            <div className="mx-auto flex h-16 max-w-[var(--container-max-narrow)] items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "var(--color-brand-soft)" }}>
              <span style={{ fontSize: "var(--text-caption)" }}>container-max-narrow (860px)</span>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-4">
            <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "var(--color-brand)" }}>
              <span style={{ fontSize: "var(--text-caption)", color: "var(--stz-white)" }}>container-max (1440px)</span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 flex h-16 items-center justify-center rounded-[var(--radius-sm)] lg:col-span-8" style={{ background: "var(--stz-navy-900)", color: "var(--stz-white)" }}>
              <span style={{ fontSize: "var(--text-caption)" }}>large content — col-span-8</span>
            </div>
            <div className="col-span-12 flex h-16 items-center justify-center rounded-[var(--radius-sm)] lg:col-span-4" style={{ background: "var(--stz-blue-300)" }}>
              <span style={{ fontSize: "var(--text-caption)" }}>small — col-span-4</span>
            </div>
            <div className="col-span-12 flex h-16 items-center justify-center rounded-[var(--radius-sm)] lg:col-span-4" style={{ background: "var(--stz-blue-300)" }}>
              <span style={{ fontSize: "var(--text-caption)" }}>small — col-span-4</span>
            </div>
            <div className="col-span-12 flex h-16 items-center justify-center rounded-[var(--radius-sm)] lg:col-span-8" style={{ background: "var(--stz-navy-900)", color: "var(--stz-white)" }}>
              <span style={{ fontSize: "var(--text-caption)" }}>large visual — col-span-8</span>
            </div>
          </div>
        </div>
      </ShowcaseSection>

      {/* 05 — BUTTONS ------------------------------------------------- */}
      <ShowcaseSection index={5} label="Components" title="Buttons" description="Six variants, three sizes, subtle interaction states.">
        <div className="flex flex-col gap-8">
          {(["primary", "secondary", "outline", "ghost", "dark", "blue"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-4">
              <span className="w-24 font-[var(--font-mono)] uppercase" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>
                {variant}
              </span>
              <Button variant={variant} size="sm">Small</Button>
              <Button variant={variant} size="md">Medium</Button>
              <Button variant={variant} size="lg">Large</Button>
              <Button variant={variant} disabled>Disabled</Button>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 06 — LINKS --------------------------------------------------- */}
      <ShowcaseSection index={6} label="Components" title="Links" description="Editorial link styles for body copy, navigation and callouts.">
        <div className="flex flex-wrap gap-10">
          <TextLink href="#" variant="standard">Standard link</TextLink>
          <TextLink href="#" variant="underline">Underlined link</TextLink>
          <TextLink href="#" variant="arrow">Arrow link</TextLink>
          <TextLink href="#" variant="nav">Nav Link</TextLink>
        </div>
      </ShowcaseSection>

      {/* 07 — BADGES / EYEBROWS ----------------------------------------- */}
      <ShowcaseSection index={7} label="Components" title="Badges, eyebrows & labels" description="Technical labels, numbered indicators, and status/category badges.">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-6">
            <TechnicalLabel>01 — Services</TechnicalLabel>
            <TechnicalLabel>02 — Selected Work</TechnicalLabel>
            <TechnicalLabel>03 — Team</TechnicalLabel>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <NumberIndicator value={1} />
            <NumberIndicator value={2} />
            <NumberIndicator value={6} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="outline">Outline</Badge>
            <Badge variant="solid">Solid</Badge>
            <Badge variant="soft">Soft</Badge>
            <Badge variant="status" tone="success">Available</Badge>
            <Badge variant="status" tone="warning">Limited</Badge>
            <Badge variant="status" tone="error">Closed</Badge>
          </div>
        </div>
      </ShowcaseSection>

      {/* 08 — CARDS --------------------------------------------------- */}
      <ShowcaseSection index={8} label="Components" title="Cards" description="One flexible primitive future modules use for team, project, service and insight cards.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card variant="standard">
            <CardEyebrow>Service</CardEyebrow>
            <CardTitle>Standard Card</CardTitle>
            <CardDescription>Default elevated surface with a subtle border and shadow.</CardDescription>
            <CardFooter>
              <TextLink href="#" variant="arrow">Learn more</TextLink>
            </CardFooter>
          </Card>
          <Card variant="dark">
            <CardEyebrow>Case Study</CardEyebrow>
            <CardTitle>Dark Card</CardTitle>
            <CardDescription style={{ color: "var(--color-muted-inverse)" }}>Deep navy surface for high-contrast moments.</CardDescription>
            <CardFooter>
              <TextLink href="#" variant="arrow" style={{ color: "var(--stz-white)" }}>View case</TextLink>
            </CardFooter>
          </Card>
          <Card variant="bordered">
            <CardEyebrow>Insight</CardEyebrow>
            <CardTitle>Bordered Card</CardTitle>
            <CardDescription>Transparent fill, border-only — for lighter compositions.</CardDescription>
            <CardFooter>
              <TextLink href="#" variant="arrow">Read insight</TextLink>
            </CardFooter>
          </Card>
          <Card variant="elevated">
            <CardEyebrow>Selected Work</CardEyebrow>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>Larger shadow for hero-adjacent featured content.</CardDescription>
          </Card>
          <Card variant="editorial">
            <SectionNumber value={4} />
            <CardTitle>Editorial Card</CardTitle>
            <CardDescription>Top-rule only — mirrors the Orionix numbered-list rhythm.</CardDescription>
          </Card>
          <Card variant="light">
            <CardEyebrow>Team</CardEyebrow>
            <CardTitle>Light Card</CardTitle>
            <CardDescription>Pure white surface for use on tinted backgrounds.</CardDescription>
          </Card>
        </div>
      </ShowcaseSection>

      {/* 09 — FORMS --------------------------------------------------- */}
      <ShowcaseSection index={9} label="Components" title="Forms" description="Foundational form controls — the Start Project/contact flows compose these later.">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="ds-name">Full name</Label>
            <Input id="ds-name" placeholder="Jane Doe" />
            <HelperText>As it should appear on the proposal.</HelperText>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="ds-email">Email</Label>
            <Input id="ds-email" type="email" placeholder="jane@company.com" aria-invalid />
            <ErrorText>Enter a valid email address.</ErrorText>
          </FieldGroup>
          <FieldGroup className="md:col-span-2">
            <Label htmlFor="ds-message">Project details</Label>
            <Textarea id="ds-message" placeholder="Tell us about the project..." />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="ds-budget">Budget range</Label>
            <Select id="ds-budget" defaultValue="">
              <option value="" disabled>
                Select a range
              </option>
              <option>$10k – $25k</option>
              <option>$25k – $75k</option>
              <option>$75k+</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Engagement type</Label>
            <div className="flex flex-col gap-3 pt-1">
              <Radio id="ds-r1" name="ds-engagement" label="One-time project" defaultChecked />
              <Radio id="ds-r2" name="ds-engagement" label="Ongoing partnership" />
            </div>
          </FieldGroup>
          <FieldGroup className="md:col-span-2">
            <Checkbox id="ds-consent" label="I agree to be contacted about this inquiry." defaultChecked />
          </FieldGroup>
        </div>
      </ShowcaseSection>

      {/* 10 — NAVIGATION PRIMITIVES --------------------------------------- */}
      <ShowcaseSection index={10} label="Components" title="Navigation primitives" description="Building blocks the global/scroll navigation (later module) will assemble.">
        <div className="flex flex-col gap-10">
          <NavGroup>
            <NavItem href="#" index={1} active>
              Services
            </NavItem>
            <NavItem href="#" index={2}>
              Projects
            </NavItem>
            <NavItem href="#" index={3}>
              Team
            </NavItem>
          </NavGroup>
          <div className="flex items-center gap-10">
            <MenuTrigger open={false} />
            <MenuTrigger open />
            <SectionIndicator count={5} activeIndex={2} />
          </div>
        </div>
      </ShowcaseSection>

      {/* 11 — SECTION PRIMITIVES ------------------------------------------ */}
      <ShowcaseSection index={11} label="Layout" title="Section primitives" description="Reusable section wrappers — normal, full-screen, dark, light, split, centered, editorial.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {["Section", "FullScreenSection", "DarkSection", "LightSection", "SplitSection", "CenteredSection", "EditorialSection"].map((name) => (
            <div key={name} className="flex h-20 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)" }}>{name}</span>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 12 — DIVIDERS & DECORATIVE -------------------------------------- */}
      <ShowcaseSection index={12} label="Components" title="Dividers & decorative elements" description="Minimal marks that support the future cinematic design rather than dominate it.">
        <div className="flex flex-col gap-8">
          <Divider />
          <div className="flex items-center gap-6">
            <Dot /> <AccentLine /> <SectionNumber value={5} />
          </div>
          <div className="relative h-24 w-40 border border-dashed border-[var(--color-border)]">
            <CornerMarker corner="top-left" />
            <CornerMarker corner="top-right" />
            <CornerMarker corner="bottom-left" />
            <CornerMarker corner="bottom-right" />
          </div>
        </div>
      </ShowcaseSection>

      {/* 13 — MOTION TOKENS --------------------------------------------- */}
      <ShowcaseSection index={13} label="Foundations" title="Motion tokens" description="The motion vocabulary Module 2 will consume — durations and easing categories, not scenes.">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <TechnicalLabel>Durations</TechnicalLabel>
            {MOTION_DURATIONS.map((d) => (
              <div key={d.token} className="flex items-center gap-4">
                <span className="w-24" style={{ fontSize: "var(--text-small)" }}>{d.name}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div className="h-full rounded-full" style={{ width: "40%", background: "var(--color-brand)", transitionDuration: `var(${d.token})` }} />
                </div>
                <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{d.token}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <TechnicalLabel>Easing</TechnicalLabel>
            {MOTION_EASES.map((e) => (
              <div key={e.token} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-3">
                <span style={{ fontSize: "var(--text-small)" }}>{e.name}</span>
                <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{e.token}</span>
              </div>
            ))}
          </div>
        </div>
      </ShowcaseSection>

      {/* 14 — RESPONSIVE ------------------------------------------------- */}
      <ShowcaseSection index={14} label="Layout" title="Responsive behavior" description="Typography, spacing and grids adapt intentionally at each breakpoint rather than simply shrinking.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Mobile", width: "< 640px" },
            { label: "Tablet", width: "640–1024px" },
            { label: "Desktop", width: "1024–1440px" },
            { label: "Large Desktop", width: "> 1440px" },
          ].map((bp) => (
            <div key={bp.label} className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-5">
              <span style={{ fontSize: "var(--text-body)" }}>{bp.label}</span>
              <span className="font-[var(--font-mono)]" style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}>{bp.width}</span>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* CLOSING ---------------------------------------------------- */}
      <DarkSection>
        <Container className="flex flex-col items-start gap-6">
          <BrandMark size={36} />
          <p className="max-w-xl" style={{ fontSize: "var(--text-body)", color: "var(--color-muted-inverse)" }}>
            This system is the shared language for every module that follows. Extend it —
            don&apos;t fork it.
          </p>
        </Container>
      </DarkSection>
    </div>
  );
}
