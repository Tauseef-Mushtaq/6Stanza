import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProjectDetail } from "@/features/projects/data/publicProjects";
import { throwPublicCmsError } from "@/lib/utils/publicCms";
import { ProjectDetailHero } from "@/features/projects/sections/ProjectDetailHero";
import { ProjectOverview } from "@/features/projects/sections/ProjectOverview";
import { ProjectChallenge } from "@/features/projects/sections/ProjectChallenge";
import { ProjectSolution } from "@/features/projects/sections/ProjectSolution";
import { ProjectArchitecture } from "@/features/projects/sections/ProjectArchitecture";
import { ProjectGallery } from "@/features/projects/sections/ProjectGallery";
import { ProjectOutcome } from "@/features/projects/sections/ProjectOutcome";
import { ProjectNextCta } from "@/features/projects/sections/ProjectNextCta";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Module 9G — returns no params at build time rather than querying
 * the CMS during `next build` (same reasoning as `/services/[slug]`
 * in Module 9F — a build-time list would go stale the moment a
 * project is published/archived afterward, and this sandbox has no
 * network path to Supabase during `next build` anyway).
 * `dynamicParams` defaults to `true`, so every slug still resolves
 * normally at request time; see MODULE-9G-HANDOFF.md §J for the full
 * caching/freshness note (the site is already fully dynamic).
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProjectDetail(slug);
  // Module 10B (spec §18) — a query failure must not fabricate
  // metadata; the page body's own read throws and hits the safe
  // error boundary, so metadata just degrades to empty here.
  if (result.status !== "found") return {};
  return {
    title: result.value.project.title,
    description: result.value.project.description,
  };
}

/**
 * Reusable project case-study template (spec §9/§10) — one dynamic
 * route rather than a page file per project, matching the pattern
 * already established for `/services/[slug]`. 404s via `notFound()`
 * for any slug with no matching published CMS project — unpublished
 * (draft/archived) and unknown slugs are indistinguishable from the
 * public route's perspective (spec §10).
 */
export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicProjectDetail(slug);
  // Module 10B (spec §13) — a query failure must never be reported as
  // a 404; only "not-found" (no published project at this slug) does.
  if (result.status === "error") throwPublicCmsError("We couldn't load this project right now. Please try again.");
  if (result.status === "not-found") notFound();

  const { project, detail, index, total, prev, next } = result.value;

  return (
    <>
      <ProjectDetailHero project={project} index={index} total={total} positioning={detail.positioning} />
      <ProjectOverview summary={detail.overview.summary} contribution={detail.overview.contribution} />
      <ProjectChallenge challenge={detail.challenge} />
      <ProjectSolution solution={detail.solution} accent={project.accent} />
      <ProjectArchitecture groups={detail.architecture} />
      <ProjectGallery accent={project.accent} seed={index} images={detail.gallery} />
      <ProjectOutcome outcomeStatement={detail.outcomeStatement} outcome={project.outcome} />
      <ProjectNextCta prev={prev} next={next} />
    </>
  );
}
