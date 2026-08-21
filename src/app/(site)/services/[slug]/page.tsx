import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicServiceDetail } from "@/features/services/data/publicServices";
import { throwPublicCmsError } from "@/lib/utils/publicCms";
import { ServiceDetailHero } from "@/features/services/sections/ServiceDetailHero";
import { ServiceProblem } from "@/features/services/sections/ServiceProblem";
import { ServiceCapabilities } from "@/features/services/sections/ServiceCapabilities";
import { ServiceArchitecture } from "@/features/services/sections/ServiceArchitecture";
import { ServiceWhy6Stanza } from "@/features/services/sections/ServiceWhy6Stanza";
import { ServiceFinalCta } from "@/features/services/sections/ServiceFinalCta";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Module 9F — deliberately returns no params at build time rather than
 * querying the CMS during `next build` (a build-time list would go
 * stale the moment a service is published/archived afterward, and
 * this sandbox has no network access to Supabase at build time
 * anyway). `dynamicParams` defaults to `true`, so every slug is still
 * resolved on request instead — see this file's note on caching below.
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicServiceDetail(slug);
  // Module 10B (spec §18) — a query failure here must not fabricate
  // metadata or claim the service doesn't exist; the page body's own
  // read will throw and hit the safe error boundary, so metadata just
  // degrades to empty rather than duplicating that error handling.
  if (result.status !== "found") return {};
  return {
    title: result.value.service.label,
    description: result.value.service.description,
  };
}

/**
 * Reusable service detail template (spec §11–§12) — one dynamic route
 * rather than eight independent page files. Six chapters, each its
 * own component under `src/features/services/sections/`, composed
 * here in order. 404s via `notFound()` for any slug with no matching
 * published CMS service.
 */
export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicServiceDetail(slug);
  // Module 10B (spec §10) — a query failure must never be reported as
  // a 404; only "not-found" (no published service at this slug) does.
  if (result.status === "error") throwPublicCmsError("We couldn't load this service right now. Please try again.");
  if (result.status === "not-found") notFound();

  const { service, detail, total, prev, next } = result.value;

  return (
    <>
      <ServiceDetailHero service={service} total={total} prev={prev} next={next} />
      <ServiceProblem problem={detail.problem} />
      <ServiceCapabilities capabilities={detail.capabilities} />
      <ServiceArchitecture stages={detail.architecture} />
      <ServiceWhy6Stanza principleIndices={detail.principles} />
      <ServiceFinalCta serviceLabel={service.label} />
    </>
  );
}
