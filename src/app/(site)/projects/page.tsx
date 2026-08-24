import type { Metadata } from "next";
import { ProjectsHero } from "@/features/projects/sections/ProjectsHero";
import { ProjectsIntro } from "@/features/projects/sections/ProjectsIntro";
import { FeaturedProjects } from "@/features/projects/sections/FeaturedProjects";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description =
  "Selected work — digital products, platforms and systems 6STANZA has designed, built and shipped.";

export const metadata: Metadata = {
  title: "Projects — Case Studies & Selected Work",
  description,
  alternates: {
    canonical: "/projects",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/projects", name: "Projects — Case Studies & Selected Work", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])} />
      <ProjectsHero />
      <ProjectsIntro />
      <FeaturedProjects />
    </>
  );
}
