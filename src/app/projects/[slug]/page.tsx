import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/features/home/data/projects";
import { getProjectDetail, getAdjacentProjects } from "@/features/projects/data/projectDetails";
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

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

/**
 * Reusable project case-study template (spec §9/§10) — one dynamic
 * route rather than a page file per project, matching the pattern
 * Module 4B already established for `/services/[slug]`. 404s via
 * `notFound()` for any slug not present in the canonical `projects`
 * list (`@/features/home/data/projects`, unchanged).
 */
export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const detail = getProjectDetail(slug);
  const adjacent = getAdjacentProjects(slug);
  if (!detail || !adjacent) notFound();

  const { prev, next } = adjacent;

  return (
    <>
      <ProjectDetailHero project={project} index={index + 1} total={projects.length} positioning={detail.positioning} />
      <ProjectOverview summary={detail.overview.summary} contribution={detail.overview.contribution} />
      <ProjectChallenge challenge={detail.challenge} />
      <ProjectSolution solution={detail.solution} accent={project.accent} />
      <ProjectArchitecture groups={detail.architecture} />
      <ProjectGallery accent={project.accent} seed={index} />
      <ProjectOutcome outcomeStatement={detail.outcomeStatement} outcome={project.outcome} />
      <ProjectNextCta prev={prev} next={next} />
    </>
  );
}
