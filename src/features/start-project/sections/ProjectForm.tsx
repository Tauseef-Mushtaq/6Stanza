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
export function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [inquiry, setInquiry] = useState<ProjectInquiry>(emptyInquiry);
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
    const nextErrors = validateInquiry(inquiry);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError(null);
    try {
      await submitInquiry(inquiry);
      onSuccess();
    } catch {
      // Entered information is preserved — `inquiry` state is untouched.
      setSubmitError("We couldn't send your message. Please try again.");
      setStatus("error");
    }
  }

  const selectedServiceLabels = services
    .filter((s) => inquiry.services.includes(s.slug))
    .map((s) => s.label);

  return (
    <form onSubmit={handleSubmit} noValidate className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container className="flex flex-col gap-20" style={{ paddingBlock: "var(--space-section)" }}>
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
            <Button type="submit" variant="primary" size="lg" disabled={status === "submitting"} className="w-fit">
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
