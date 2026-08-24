import type { Metadata } from "next";
import { AboutHero } from "@/features/about/sections/AboutHero";
import { WhoWeAre } from "@/features/about/sections/WhoWeAre";
import { Philosophy } from "@/features/about/sections/Philosophy";
import { Process } from "@/features/about/sections/Process";
import { Values } from "@/features/about/sections/Values";
import { Direction } from "@/features/about/sections/Direction";
import { FinalCta } from "@/features/about/sections/FinalCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description =
  "6STANZA is a technology partner for strategy, software, and infrastructure — this is who we are and how we work.";

export const metadata: Metadata = {
  title: "About Us — Technology Partner in Pakistan",
  description,
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/about", name: "About Us", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <AboutHero />
      <WhoWeAre />
      <Philosophy />
      <Process />
      <Values />
      <Direction />
      <FinalCta />
    </>
  );
}
