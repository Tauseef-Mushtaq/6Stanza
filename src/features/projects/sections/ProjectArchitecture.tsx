import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import type { ArchitectureGroup } from "@/features/projects/data/projectDetails";

interface ProjectArchitectureProps {
  groups: ArchitectureGroup[];
}

/**
 * CHAPTER 05 — technical architecture (spec §10 Ch.05), one of the
 * strongest sections per the brief. A vertical flow of labeled groups
 * connected by a drawn line, each group listing only technologies the
 * project's own data actually includes — nothing invented. Same
 * abstract line-and-node technique as Services' Architecture chapter
 * (reused deliberately, per its own note) but read top-to-bottom as a
 * stack instead of left-to-right as a pipeline, so it doesn't read as
 * a straight copy.
 */
export function ProjectArchitecture({ groups }: ProjectArchitectureProps) {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>05 — Architecture</TechnicalLabel>
        </Reveal>

        <div className="relative mt-16 flex flex-col items-center">
          <svg
            viewBox={`0 0 20 ${groups.length * 40}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute left-1/2 top-0 h-full w-6 -translate-x-1/2"
            aria-hidden
          >
            <line
              x1="10"
              y1="0"
              x2="10"
              y2={groups.length * 40}
              stroke="var(--color-border-inverse)"
              strokeWidth="0.4"
              opacity={0.6}
            />
            <line
              x1="10"
              y1="0"
              x2="10"
              y2={groups.length * 40}
              stroke="var(--color-brand)"
              strokeWidth="0.5"
              strokeDasharray="1.4 3"
              opacity={0.5}
            />
          </svg>

          {groups.map((group, i) => (
            <Reveal
              key={group.label}
              direction="up"
              delay={0.08 * i}
              className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-4 py-8 text-center"
            >
              <span
                className="rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--color-brand)",
                  boxShadow: "0 0 14px var(--color-brand)",
                }}
                aria-hidden
              />
              <span
                className="font-[var(--font-mono)] uppercase"
                style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand-soft)" }}
              >
                {group.label}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-display)] tracking-tight"
                    style={{
                      fontSize: "var(--text-h4)",
                      border: "1px solid var(--color-border-inverse)",
                      background: "var(--stz-navy-800)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
