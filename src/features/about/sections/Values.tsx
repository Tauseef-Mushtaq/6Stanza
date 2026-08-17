import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

const values = [
  {
    label: "Reliability",
    description: "Systems that keep working after the launch celebration is over.",
  },
  {
    label: "Honesty",
    description: "If something isn't feasible in your timeline or budget, we say so early — not after we've taken the money.",
  },
  {
    label: "Clear communication",
    description: "You should always know what's happening with your project, in plain terms, without having to ask.",
  },
  {
    label: "Realistic commitments",
    description: "We'd rather promise less and deliver it than promise everything and deliver a fraction of it.",
  },
  {
    label: "Delivery discipline",
    description: "Scope, timeline, and quality are treated as commitments, not aspirations.",
  },
  {
    label: "Long-term thinking",
    description: "We build the version of the system that's still the right decision two years from now.",
  },
];

/**
 * CHAPTER 05 — What We Value. An editorial trust chapter — a numbered
 * list read as a manifesto, not a grid of trust-badge cards. No
 * invented stats, awards, or client counts (per §9 content rules).
 */
export function Values() {
  return (
    <section className="relative w-full" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>05 — What We Value</TechnicalLabel>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            The things we won&apos;t compromise on.
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col">
          <Divider style={{ background: "var(--color-border-inverse)" }} />
          {values.map((value, i) => (
            <Reveal key={value.label} direction="up" delay={0.03 * i}>
              <div
                className="grid grid-cols-1 gap-3 py-8 lg:grid-cols-12 lg:items-baseline lg:gap-10"
                style={{ borderBottom: "1px solid var(--color-border-inverse)" }}
              >
                <span
                  className="font-[var(--font-mono)] tabular-nums lg:col-span-1"
                  style={{ fontSize: "var(--text-label)", color: "var(--color-brand-soft)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-[var(--font-display)] tracking-tight lg:col-span-4"
                  style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
                >
                  {value.label}
                </h3>
                <p className="lg:col-span-7" style={{ color: "var(--color-muted-inverse)", fontSize: "var(--text-body)" }}>
                  {value.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
