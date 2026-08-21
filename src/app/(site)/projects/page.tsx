import type { Metadata } from "next";
import { ProjectsHero } from "@/features/projects/sections/ProjectsHero";
import { ProjectsIntro } from "@/features/projects/sections/ProjectsIntro";
import { FeaturedProjects } from "@/features/projects/sections/FeaturedProjects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected work — digital products, platforms and systems 6STANZA has designed, built and shipped.",
};

export default function Page() {
  return (
    <>
      <ProjectsHero />
      <ProjectsIntro />
      <FeaturedProjects />
    </>
  );
}
