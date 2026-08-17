import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/features/home/data/services";
import { getServiceDetail } from "@/features/services/data/serviceDetails";
import { ServiceDetailHero } from "@/features/services/sections/ServiceDetailHero";
import { ServiceProblem } from "@/features/services/sections/ServiceProblem";
import { ServiceCapabilities } from "@/features/services/sections/ServiceCapabilities";
import { ServiceArchitecture } from "@/features/services/sections/ServiceArchitecture";
import { ServiceWhy6Stanza } from "@/features/services/sections/ServiceWhy6Stanza";
import { ServiceFinalCta } from "@/features/services/sections/ServiceFinalCta";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return {
    title: service.label,
    description: service.description,
  };
}

/**
 * Reusable service detail template (spec §11–§12) — one dynamic route
 * rather than eight independent page files. Six chapters, each its
 * own component under `src/features/services/sections/`, composed
 * here in order. 404s via `notFound()` for any slug not present in
 * the canonical `services` list.
 */
export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const index = services.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const service = services[index];
  const detail = getServiceDetail(slug);
  if (!detail) notFound();

  const total = services.length;
  const prev = services[(index - 1 + total) % total];
  const next = services[(index + 1) % total];

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
