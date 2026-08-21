import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Reveal } from "@/components/motion";
import { team } from "@/features/home/data/team";

/**
 * CHAPTER 06 — editorial team presentation: tall proportioned cards,
 * a monogram treatment standing in for photography until real assets
 * exist, and a consistent hover lift. Data-shaped for a future CMS.
 *
 * Module 9H note: this component is not imported by any active route
 * (`src/app/(site)/page.tsx` renders `TeamJourney` instead — see
 * `MODULE-9H-HANDOFF.md` §K). It's left as-is, out of scope for this
 * migration, and is the reason `src/features/home/data/team.ts` still
 * exports a runtime `team` array rather than only the `TeamMember` type.
 */
export function Team() {
  return (
    <section className="relative w-full" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>06 — Team</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            The people behind the systems
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <Reveal key={member.slug} direction="up" delay={i * 0.06}>
              <Card
                variant="dark"
                className="group h-full justify-between gap-8 transition-transform duration-300 hover:-translate-y-1.5"
                style={{ background: "var(--stz-navy-800)" }}
              >
                <div
                  className="flex aspect-[4/5] w-full items-center justify-center rounded-[var(--radius-md)] font-[var(--font-display)] transition-[filter] duration-300 group-hover:brightness-110"
                  style={{
                    background: "linear-gradient(160deg, var(--stz-navy-700), var(--stz-blue-600))",
                    fontSize: "var(--text-h1)",
                    color: "rgba(247,249,252,0.85)",
                  }}
                  aria-hidden
                >
                  {member.initials}
                </div>
                <div className="flex flex-col gap-2">
                  <CardTitle style={{ color: "var(--stz-white)" }}>{member.name}</CardTitle>
                  <span
                    className="font-[var(--font-mono)] uppercase"
                    style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand-soft)" }}
                  >
                    {member.role}
                  </span>
                  <CardDescription style={{ color: "var(--color-muted-inverse)" }}>
                    {member.shortBio}
                  </CardDescription>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
