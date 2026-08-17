"use client";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { SectionNumber, AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { BrandMark } from "@/components/ui/BrandMark";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ScaleReveal } from "@/components/motion/ScaleReveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { PinnedScene } from "@/components/motion/PinnedScene";
import { HorizontalScroller } from "@/components/motion/HorizontalScroller";
import { CinematicScene, SceneBackground, SceneContent, SceneVisual } from "@/components/motion/CinematicScene";
import { SceneTransitionStage } from "@/components/motion/SceneTransitionStage";
import { ImageEntrance, PinnedImageCrop } from "@/components/motion/ImageMotion";
import { CinematicCanvasScene } from "@/components/motion/CinematicCanvasScene";
import { ScrollDrivenGroup } from "@/lib/three/ScrollDrivenGroup";

const HORIZONTAL_ITEMS = [
  { number: "01", title: "Web Development" },
  { number: "02", title: "Cloud" },
  { number: "03", title: "DevOps" },
  { number: "04", title: "Product Engineering" },
  { number: "05", title: "Design Systems" },
];

function Placeholder({ className, tone = "brand" }: { className?: string; tone?: "brand" | "navy" }) {
  return (
    <div
      className={className}
      style={{
        background:
          tone === "brand"
            ? "linear-gradient(135deg, var(--stz-blue-600), var(--stz-blue-400))"
            : "linear-gradient(135deg, var(--stz-navy-900), var(--stz-navy-700))",
        borderRadius: "var(--radius-lg)",
      }}
    />
  );
}

export default function MotionShowcasePage() {
  return (
    <>
      {/* Internal dev notice */}
      <div
        className="w-full py-3 text-center"
        style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
      >
        <TechnicalLabel style={{ color: "var(--color-muted-inverse)" }}>
          Internal development route — Module 2 motion engine showcase, not the final homepage
        </TechnicalLabel>
      </div>

      {/* 0 — Intro / brand mark moment */}
      <section className="relative flex min-h-[70svh] w-full flex-col items-center justify-center overflow-hidden" style={{ background: "var(--stz-navy-950)" }}>
        <SubtleGrid />
        <Reveal direction="none" duration={1.2}>
          <BrandMark size={72} priority className="mx-auto" />
        </Reveal>
        <Reveal direction="up" delay={0.3} className="mt-8 text-center">
          <TechnicalLabel style={{ color: "var(--color-muted-inverse)" }}>
            Cinematic Experience &amp; Motion Engine — Module 2
          </TechnicalLabel>
        </Reveal>
      </section>

      {/* 1 — Reveal */}
      <Section>
        <Container className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <SectionNumber value={1} />
            <AccentLine />
            <TechnicalLabel>Reveal</TechnicalLabel>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Reveal direction="up" className="rounded-[var(--radius-lg)] border p-8" style={{ borderColor: "var(--color-border)" }}>
              <p style={{ fontSize: "var(--text-h4)" }}>Vertical reveal</p>
            </Reveal>
            <Reveal direction="left" clip delay={0.1} className="rounded-[var(--radius-lg)] border p-8" style={{ borderColor: "var(--color-border)" }}>
              <p style={{ fontSize: "var(--text-h4)" }}>Masked reveal</p>
            </Reveal>
            <Reveal direction="right" delay={0.2} className="rounded-[var(--radius-lg)] border p-8" style={{ borderColor: "var(--color-border)" }}>
              <p style={{ fontSize: "var(--text-h4)" }}>Directional reveal</p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* 8 — Typography choreography */}
      <Section style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
        <Container className="flex flex-col gap-10">
          <div className="flex items-center gap-3">
            <SectionNumber value={2} />
            <AccentLine />
            <TechnicalLabel style={{ color: "var(--color-muted-inverse)" }}>Typography choreography</TechnicalLabel>
          </div>
          <SplitHeading unit="lines" as="h2" className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}>
            Precision engineering, told through motion and editorial typography.
          </SplitHeading>
          <SplitHeading unit="words" as="p" start="top 90%" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)", maxWidth: 640 }}>
            Word-level stagger for supporting copy, distinct from the line-mask treatment above.
          </SplitHeading>
        </Container>
      </Section>

      {/* 2 — Parallax */}
      <Section className="relative overflow-hidden">
        <Container>
          <div className="mb-10 flex items-center gap-3">
            <SectionNumber value={3} />
            <AccentLine />
            <TechnicalLabel>Parallax</TechnicalLabel>
          </div>
          <div className="relative h-[70svh] overflow-hidden rounded-[var(--radius-xl)]" style={{ background: "var(--stz-navy-900)" }}>
            <Parallax speed={0.15} className="absolute inset-[-10%]">
              <Placeholder tone="navy" className="h-full w-full opacity-40" />
            </Parallax>
            <Parallax speed={0.6} className="absolute inset-x-[15%] top-[20%] h-1/2">
              <Placeholder tone="brand" className="h-full w-full" />
            </Parallax>
            <Parallax speed={1.1} className="absolute inset-x-8 bottom-8">
              <p style={{ color: "var(--stz-white)", fontSize: "var(--text-h3)" }}>Layered depth, three speeds</p>
            </Parallax>
          </div>
        </Container>
      </Section>

      {/* 3 — Scale / zoom */}
      <Section>
        <Container>
          <div className="mb-10 flex items-center gap-3">
            <SectionNumber value={4} />
            <AccentLine />
            <TechnicalLabel>Scale / zoom</TechnicalLabel>
          </div>
          <ScaleReveal from={0.85} to={1} className="h-[60svh] w-full overflow-hidden rounded-[var(--radius-xl)]">
            <Placeholder tone="brand" className="h-full w-full" />
          </ScaleReveal>
        </Container>
      </Section>

      {/* 9 — Image choreography (entrance + pinned crop) */}
      <Section>
        <Container className="mb-10 flex items-center gap-3">
          <SectionNumber value={5} />
          <AccentLine />
          <TechnicalLabel>Image choreography</TechnicalLabel>
        </Container>
        <Container className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <ImageEntrance className="h-[50svh] rounded-[var(--radius-lg)]">
            <Placeholder tone="navy" className="h-full w-full" />
          </ImageEntrance>
          <ImageEntrance className="h-[50svh] rounded-[var(--radius-lg)]" rotateFrom={-2.5} scaleFrom={1.2}>
            <Placeholder tone="brand" className="h-full w-full" />
          </ImageEntrance>
        </Container>
        <PinnedImageCrop scaleFrom={1} scaleTo={1.4}>
          <Placeholder tone="navy" className="h-full w-full" />
        </PinnedImageCrop>
      </Section>

      {/* 6 — Horizontal scroll */}
      <Section>
        <Container className="mb-10 flex items-center gap-3">
          <SectionNumber value={6} />
          <AccentLine />
          <TechnicalLabel>Horizontal scroll (vertical → horizontal)</TechnicalLabel>
        </Container>
        <HorizontalScroller className="px-[var(--container-padding)]">
          {HORIZONTAL_ITEMS.map((item) => (
            <div
              key={item.number}
              className="flex h-[60svh] w-[70vw] shrink-0 flex-col justify-end rounded-[var(--radius-xl)] p-10 md:w-[36vw]"
              style={{ background: "var(--stz-navy-900)", color: "var(--stz-white)" }}
            >
              <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>{item.number}</TechnicalLabel>
              <p style={{ fontSize: "var(--text-h3)", marginTop: "var(--space-sm)" }}>{item.title}</p>
            </div>
          ))}
        </HorizontalScroller>
      </Section>

      {/* 5 — Pinned scene + scene/chapter architecture */}
      <CinematicScene start="top top" end="+=150%" className="min-h-svh">
        <PinnedScene durationVh={1.5}>
          <SceneBackground>
            <Placeholder tone="navy" className="h-full w-full" />
          </SceneBackground>
          <SceneContent className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <SectionNumber value={7} />
            <TechnicalLabel style={{ color: "var(--color-muted-inverse)" }}>Pinned scene</TechnicalLabel>
            <p style={{ color: "var(--stz-white)", fontSize: "var(--text-h2)", maxWidth: 720 }}>
              The section holds while an internal scene progresses from scroll.
            </p>
          </SceneContent>
          <SceneVisual />
        </PinnedScene>
      </CinematicScene>

      {/* 7 — Scene transition */}
      <Section>
        <Container className="mb-10 flex items-center gap-3">
          <SectionNumber value={8} />
          <AccentLine />
          <TechnicalLabel>Scene transition</TechnicalLabel>
        </Container>
        <SceneTransitionStage
          style="clip-scale"
          panels={[
            {
              key: "a",
              content: (
                <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--stz-navy-900)" }}>
                  <p style={{ color: "var(--stz-white)", fontSize: "var(--text-h1)" }}>Scene A</p>
                </div>
              ),
            },
            {
              key: "b",
              content: (
                <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--stz-blue-500)" }}>
                  <p style={{ color: "var(--stz-white)", fontSize: "var(--text-h1)" }}>Scene B</p>
                </div>
              ),
            },
          ]}
        />
      </Section>

      {/* 10 — 3D scroll interaction */}
      <Section>
        <Container className="mb-10 flex items-center gap-3">
          <SectionNumber value={9} />
          <AccentLine />
          <TechnicalLabel>3D scroll interaction</TechnicalLabel>
        </Container>
        <div className="h-[120svh] w-full">
          <CinematicCanvasScene
            className="sticky top-0 h-svh"
            fallback={
              <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--stz-navy-950)" }}>
                <BrandMark size={64} />
              </div>
            }
          >
            {(progressRef) => (
              <>
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 4, 4]} intensity={1.2} />
                <ScrollDrivenGroup
                  progressRef={progressRef}
                  keyframes={[
                    { at: 0, position: [0, -1.2, 0], rotation: [0, 0, 0], scale: 0.4 },
                    { at: 0.25, position: [0, 0, 0], rotation: [0.4, 0.8, 0], scale: 0.9 },
                    { at: 0.5, position: [0.4, 0, 0], rotation: [0.8, 1.6, 0.2], scale: 1.1 },
                    { at: 0.75, position: [-0.4, 0.2, 0], rotation: [1.2, 2.4, 0.4], scale: 1 },
                    { at: 1, position: [0, 1.4, -1], rotation: [1.6, 3.2, 0], scale: 0.3 },
                  ]}
                >
                  <mesh>
                    <torusKnotGeometry args={[0.9, 0.28, 128, 32]} />
                    <meshStandardMaterial color="#1f63ff" metalness={0.4} roughness={0.25} />
                  </mesh>
                </ScrollDrivenGroup>
              </>
            )}
          </CinematicCanvasScene>
        </div>
      </Section>

      {/* 4 — Scroll progress (visualized) */}
      <Section>
        <Container className="mb-10 flex items-center gap-3">
          <SectionNumber value={10} />
          <AccentLine />
          <TechnicalLabel>Scroll progress driving a CSS custom property</TechnicalLabel>
        </Container>
        <CinematicScene start="top bottom" end="bottom top" className="min-h-[60svh]">
          <SceneContent className="flex h-full items-center justify-center">
            <div
              className="h-3 w-2/3 overflow-hidden rounded-full"
              style={{ background: "var(--color-border)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: "var(--color-brand)",
                  width: "calc(var(--scene-progress, 0) * 100%)",
                }}
              />
            </div>
          </SceneContent>
        </CinematicScene>
      </Section>

      <div className="pb-24" />
    </>
  );
}
