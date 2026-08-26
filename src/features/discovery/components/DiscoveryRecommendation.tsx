"use client";

import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import type { Recommendation } from "@/features/discovery/lib/recommend";

export function DiscoveryRecommendation({
  recommendations,
  isFallback,
  onTalkTo6Stanza,
  onRestart,
}: {
  recommendations: Recommendation[];
  isFallback: boolean;
  onTalkTo6Stanza: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Reveal direction="up">
        <p className="font-[var(--font-display)] tracking-tight" style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}>
          {isFallback ? "We need a bit more context to be precise —" : "Based on what you told us, here's where to start:"}
        </p>
      </Reveal>

      {isFallback ? (
        <Reveal direction="up" delay={0.05}>
          <p style={{ fontSize: "var(--text-body)", color: "var(--color-text-secondary)" }}>
            Your answers were a bit open-ended, so here&apos;s a safe starting point — a short conversation will scope the
            specifics far better than a guess would.
          </p>
        </Reveal>
      ) : null}

      <div className="flex flex-col gap-3">
        <Divider />
        {recommendations.map((rec, i) => (
          <Reveal direction="up" delay={0.05 * (i + 1)} key={rec.slug}>
            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-center gap-5">
                <span
                  className="font-[var(--font-display)] tabular-nums"
                  style={{ fontSize: "var(--text-h3)", lineHeight: 1, color: "var(--color-brand)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-[var(--font-display)] tracking-tight" style={{ fontSize: "var(--text-body-lg)" }}>
                  {rec.label}
                </span>
              </div>
              <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)", marginLeft: "calc(var(--text-h3) + 1.25rem)" }}>
                {rec.reason}
              </p>
            </div>
            <Divider />
          </Reveal>
        ))}
      </div>

      <Reveal direction="up" delay={0.05 * (recommendations.length + 1)} className="flex flex-wrap items-center gap-4 pt-2">
        <Button type="button" variant="primary" size="lg" onClick={onTalkTo6Stanza}>
          Talk to 6STANZA
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onRestart}>
          Start over
        </Button>
      </Reveal>
    </div>
  );
}
