import type { Metadata } from "next";
import { ServicesHero } from "@/features/services/sections/ServicesHero";
import { ServiceProgression } from "@/features/services/sections/ServiceProgression";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Eight disciplines, one coherent system — web development, cloud, DevOps, security, networking, marketing, video and SEO.",
};

export default function Page() {
  return (
    <>
      <ServicesHero />
      <ServiceProgression />
    </>
  );
}
