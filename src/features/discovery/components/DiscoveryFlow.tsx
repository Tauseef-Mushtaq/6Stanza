"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { Reveal } from "@/components/motion";
import { OptionPills } from "@/features/start-project/components/OptionPills";
import { ServiceSelector } from "@/features/start-project/components/ServiceSelector";
import { services as canonicalServices } from "@/features/home/data/services";
import { timelines } from "@/features/start-project/data/inquiry";
import { DiscoverySingleSelect } from "@/features/discovery/components/DiscoverySingleSelect";
import { DiscoveryRecommendation } from "@/features/discovery/components/DiscoveryRecommendation";
import { q1Options, q2Options, q3Options, emptyDiscoveryAnswers, type DiscoveryAnswers, type Q4Timeline } from "@/features/discovery/data/questions";
import { recommend, labelForQ1, labelForQ2, labelForQ3 } from "@/features/discovery/lib/recommend";
import { setDiscoveryPrefill } from "@/features/discovery/lib/prefillBridge";

const TOTAL_STEPS = 5;

/**
 * Smart Project Discovery — 5-question guided flow (spec: "4–6
 * questions maximum") ending in a deterministic recommendation, then a
 * "Talk to 6STANZA" handoff into the real, unmodified `/start-project`
 * form.
 *
 * Explicitly reuses existing pieces rather than building a parallel
 * system: `OptionPills` and `ServiceSelector` are the exact same
 * components `/start-project` itself uses (same canonical
 * `timelines` and `services` list), and the handoff writes into
 * `sessionStorage` for `/start-project` to read — it never calls the
 * submission backend itself and never treats its own output as
 * authoritative; the real form's client validation and the existing
 * `submitProjectInquiryAction` are exactly what runs on submit.
 */
export function DiscoveryFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..4 = questions, 5 = recommendation
  const [answers, setAnswers] = useState<DiscoveryAnswers>(emptyDiscoveryAnswers);
  const [attemptedNext, setAttemptedNext] = useState(false);

  const result = useMemo(() => recommend(answers, canonicalServices), [answers]);

  const currentAnswered = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(answers.q1);
      case 1:
        return Boolean(answers.q2);
      case 2:
        return Boolean(answers.q3);
      case 3:
        return Boolean(answers.q4);
      case 4:
        return true; // Q5 is an optional refinement, not required — a visitor with "not sure" for everything else can still finish.
      default:
        return true;
    }
  }, [step, answers]);

  function goNext() {
    if (!currentAnswered) {
      setAttemptedNext(true);
      return;
    }
    setAttemptedNext(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setAttemptedNext(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  function restart() {
    setAnswers(emptyDiscoveryAnswers);
    setAttemptedNext(false);
    setStep(0);
  }

  function handleTalkTo6Stanza() {
    const parts: string[] = [];
    const q1Label = labelForQ1(answers.q1);
    const q2Label = labelForQ2(answers.q2);
    const q3Label = labelForQ3(answers.q3);
    if (q1Label) parts.push(`What I'm building: ${q1Label}.`);
    if (q2Label) parts.push(`The problem I'm solving: ${q2Label}.`);
    if (q3Label) parts.push(`Current system: ${q3Label}.`);
    if (answers.q4) parts.push(`Timeline: ${answers.q4}.`);

    // A pre-drafted, fully editable starting point — not authoritative
    // data. The visitor reviews and can change every one of these
    // fields on the real form before anything is ever submitted.
    setDiscoveryPrefill({
      projectTitle: q1Label ?? "",
      services: result.recommendations.map((r) => r.slug),
      timeline: answers.q4,
      message: parts.length > 0 ? `${parts.join(" ")}\n\n(From Smart Project Discovery — feel free to edit any of this.)` : "",
    });

    router.push("/start-project");
  }

  const isRecommendation = step === TOTAL_STEPS;

  return (
    <div className="flex flex-col gap-8">
      <Reveal direction="up" className="flex items-center justify-between gap-4">
        <TechnicalLabel>{isRecommendation ? "Result" : `Question ${step + 1} of ${TOTAL_STEPS}`}</TechnicalLabel>
        {!isRecommendation ? (
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className="h-1 w-6 rounded-full transition-colors"
                style={{ background: i <= step ? "var(--color-brand)" : "var(--color-border)" }}
              />
            ))}
          </div>
        ) : null}
      </Reveal>

      {step === 0 ? (
        <Reveal direction="up" delay={0.05} className="flex flex-col gap-6" key="q1">
          <Question title="What are you trying to build?">
            <DiscoverySingleSelect label="What are you trying to build?" options={q1Options} value={answers.q1} onChange={(id) => setAnswers((a) => ({ ...a, q1: id }))} />
          </Question>
        </Reveal>
      ) : null}

      {step === 1 ? (
        <Reveal direction="up" delay={0.05} className="flex flex-col gap-6" key="q2">
          <Question title="What problem are you solving?">
            <DiscoverySingleSelect label="What problem are you solving?" options={q2Options} value={answers.q2} onChange={(id) => setAnswers((a) => ({ ...a, q2: id }))} />
          </Question>
        </Reveal>
      ) : null}

      {step === 2 ? (
        <Reveal direction="up" delay={0.05} className="flex flex-col gap-6" key="q3">
          <Question title="Do you already have a system?">
            <DiscoverySingleSelect label="Do you already have a system?" options={q3Options} value={answers.q3} onChange={(id) => setAnswers((a) => ({ ...a, q3: id }))} />
          </Question>
        </Reveal>
      ) : null}

      {step === 3 ? (
        <Reveal direction="up" delay={0.05} className="flex flex-col gap-6" key="q4">
          <Question title="What's your timeline?">
            <OptionPills label="Timeline" options={timelines} value={answers.q4} onChange={(v) => setAnswers((a) => ({ ...a, q4: (v || undefined) as Q4Timeline | undefined }))} />
          </Question>
        </Reveal>
      ) : null}

      {step === 4 ? (
        <Reveal direction="up" delay={0.05} className="flex flex-col gap-6" key="q5">
          <Question title="What services might you need?" hint="Optional — pick any you already have in mind, or skip this and we'll infer it from your answers.">
            <ServiceSelector services={canonicalServices} selected={answers.q5} onToggle={(slug) => setAnswers((a) => ({ ...a, q5: a.q5.includes(slug) ? a.q5.filter((s) => s !== slug) : [...a.q5, slug] }))} />
          </Question>
        </Reveal>
      ) : null}

      {isRecommendation ? (
        <DiscoveryRecommendation recommendations={result.recommendations} isFallback={result.isFallback} onTalkTo6Stanza={handleTalkTo6Stanza} onRestart={restart} />
      ) : (
        <Reveal direction="up" delay={0.1} className="flex flex-col gap-3 pt-2">
          {attemptedNext && !currentAnswered ? (
            <p role="alert" style={{ color: "#ff6b6b", fontSize: "var(--text-caption)" }}>
              Pick an option to continue.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <Button type="button" variant="outline" size="md" onClick={goBack} disabled={step === 0}>
              Back
            </Button>
            <Button type="button" variant="primary" size="md" onClick={goNext}>
              {step === TOTAL_STEPS - 1 ? "See recommendation" : "Next"}
            </Button>
            {step > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={restart} className="ml-auto">
                Restart
              </Button>
            ) : null}
          </div>
        </Reveal>
      )}
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-[var(--font-display)] tracking-tight" style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}>
          {title}
        </h2>
        {hint ? <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
