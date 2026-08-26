"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion";
import { TextField, TextAreaField } from "@/features/start-project/components/FormField";
import { ServiceSelector } from "@/features/start-project/components/ServiceSelector";
import { OptionPills } from "@/features/start-project/components/OptionPills";
import { services } from "@/features/home/data/services";
import { submitInquiry } from "@/features/start-project/lib/submitInquiry";
import {
  emptyInquiry,
  validateInquiry,
  projectStages,
  timelines,
  budgetRanges,
  type ProjectInquiry,
  type InquiryErrors,
} from "@/features/start-project/data/inquiry";

type Status = "idle" | "submitting" | "error";

/**
 * CHAPTERS 02–06 as one continuous, comfortably-scrolling form rather
 * than five forced 100vh sections (§16 — form areas just need enough
 * height for comfortable interaction, not a full viewport each).
 * Numbered chapter headers keep the editorial pacing without pinning.
 */
export function ProjectForm({
  onSuccess,
  initial,
}: {
  // Module: Consultation Booking 1 — now receives the submitted
  // `ProjectInquiry` rather than firing with no arguments. Purely
  // additive: every existing caller that ignored the (previously
  // nonexistent) argument still works, and `StartProjectPageContent`
  // uses it only to pass name/email through as a convenience prefill
  // to `/start-project/consultation` — the inquiry submission itself
  // (`submitInquiry` below) is completely unchanged.
  onSuccess: (inquiry: ProjectInquiry) => void;
  initial?: Partial<ProjectInquiry>;
}) {
  // Module: Smart Project Discovery handoff — `initial` (from
  // `takeDiscoveryPrefill()` in `StartProjectPageContent`) only ever
  // seeds this component's OWN local state. Nothing downstream
  // changes: the same `validateInquiry` and `submitInquiry` run
  // exactly as before, so a discovery-prefilled submission is
  // validated identically to a manually-typed one, and every prefilled
  // value stays fully editable before it does.
  const [inquiry, setInquiry] = useState<ProjectInquiry>(() => ({ ...emptyInquiry, ...initial }));
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function field<K extends keyof ProjectInquiry>(key: K, value: ProjectInquiry[K]) {
    setInquiry((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(slug: string) {
    setInquiry((prev) => ({
      ...prev,
      services: prev.services.includes(slug)
        ? prev.services.filter((s) => s !== slug)
        : [...prev.services, slug],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Guards against a double-click/double-Enter submitting twice before
    // the `loading` state has a chance to disable the button (spec §22).
    if (status === "submitting") return;

    const nextErrors = validateInquiry(inquiry);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError(null);
    try {
      await submitInquiry(inquiry);
      onSuccess(inquiry);
    } catch (err) {
      // Entered information is preserved — `inquiry` state is untouched.
      // `submitInquiry` already resolves the failure down to a safe,
      // user-facing message (validation-drift vs. a real server/DB
      // failure both arrive here as `Error.message`) — use it instead
      // of a hardcoded string, so the person sees why it failed rather
      // than always the same generic line.
      const message = err instanceof Error && err.message ? err.message : "We couldn't send your message. Please try again.";
      setSubmitError(message);
      setStatus("error");
    }
  }

  const selectedServiceLabels = services
    .filter((s) => inquiry.services.includes(s.slug))
    .map((s) => s.label);

  return (
    <form onSubmit={handleSubmit} noValidate className="relative w-full" style={{ background: "var(--color-background)" }}>
      {/*
        Module 10F — honeypot field for `projectInquirySchema`'s
        `website` check (spec: bots fill every field; real visitors
        never see or reach this one). Visually and from-AT hidden
        without `display:none`/`hidden` (some bots skip those), kept
        out of tab order, and not `autocomplete`d.
      */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="website">Leave this field blank</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={inquiry.website}
          onChange={(e) => field("website", e.target.value)}
        />
      </div>
      <Container className="flex flex-col gap-20" style={{ paddingBlock: "var(--space-section)" }}>
        {initial ? (
          <Reveal direction="up" className="-mb-12">
            <p
              className="rounded-[var(--radius-md)] px-4 py-3"
              style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              Prefilled from your Smart Project Discovery answers — feel free to edit anything below before sending.
            </p>
          </Reveal>
        ) : null}
        {/* CHAPTER 02 — Project Context */}
        <div className="flex flex-col gap-8">
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>02 — Project Context</TechnicalLabel>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Reveal direction="up" delay={0.03}>
              <TextField
                label="Name"
                name="name"
                autoComplete="name"
                value={inquiry.name}
                onChange={(e) => field("name", e.target.value)}
                error={errors.name}
              />
            </Reveal>
            <Reveal direction="up" delay={0.06}>
              <TextField
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                value={inquiry.email}
                onChange={(e) => field("email", e.target.value)}
                error={errors.email}
              />
            </Reveal>
            <Reveal direction="up" delay={0.09}>
              <TextField
                label="Company / Organization"
                name="company"
                autoComplete="organization"
                optional
                value={inquiry.company}
                onChange={(e) => field("company", e.target.value)}
              />
            </Reveal>
            <Reveal direction="up" delay={0.12}>
              <TextField
                label="What are you looking to build?"
                name="projectTitle"
                value={inquiry.projectTitle}
                onChange={(e) => field("projectTitle", e.target.value)}
                error={errors.projectTitle}
              />
            </Reveal>
          </div>
        </div>

        {/* CHAPTER 03 — Service Selection */}
        <div className="flex flex-col gap-8">
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>03 — Where You Need Us</TechnicalLabel>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <ServiceSelector services={services} selected={inquiry.services} onToggle={toggleService} error={errors.services} />
          </Reveal>
        </div>

        {/* CHAPTER 04 — Project Scale / Timeline */}
        <div className="flex flex-col gap-8">
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>04 — Scope &amp; Timeline</TechnicalLabel>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Reveal direction="up" delay={0.03}>
              <OptionPills label="Project stage" options={projectStages} value={inquiry.stage} onChange={(v) => field("stage", v)} />
            </Reveal>
            <Reveal direction="up" delay={0.06}>
              <OptionPills label="Timeline" options={timelines} value={inquiry.timeline} onChange={(v) => field("timeline", v)} />
            </Reveal>
            <Reveal direction="up" delay={0.09}>
              <OptionPills label="Budget range" options={budgetRanges} value={inquiry.budget} onChange={(v) => field("budget", v)} />
            </Reveal>
          </div>
        </div>

        {/* CHAPTER 05 — Message */}
        <div className="flex flex-col gap-8">
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>05 — The Brief</TechnicalLabel>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <TextAreaField
              label="What are you trying to make possible?"
              name="message"
              rows={7}
              value={inquiry.message}
              onChange={(e) => field("message", e.target.value)}
              error={errors.message}
            />
          </Reveal>
        </div>

        {/* CHAPTER 06 — Review / Submit */}
        <div className="flex flex-col gap-6 border-t pt-12" style={{ borderColor: "var(--color-border)" }}>
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>06 — Review</TechnicalLabel>
          </Reveal>

          <Reveal direction="up" delay={0.05} className="flex flex-wrap gap-2">
            {selectedServiceLabels.length > 0 ? (
              selectedServiceLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-[var(--radius-pill)] px-3 py-1"
                  style={{ fontSize: "var(--text-caption)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  {label}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>No services selected yet</span>
            )}
          </Reveal>

          <Reveal direction="up" delay={0.1} className="flex flex-col gap-4">
            <Button type="submit" variant="primary" size="lg" loading={status === "submitting"} className="w-fit">
              {status === "submitting" ? "Sending…" : "Start the conversation"}
            </Button>
            {submitError ? (
              <p role="alert" style={{ color: "#d64545", fontSize: "var(--text-caption)" }}>
                {submitError}
              </p>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </form>
  );
}
