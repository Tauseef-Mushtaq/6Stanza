import type { Metadata } from "next";
import { ServicesHero } from "@/features/services/sections/ServicesHero";
import { ServiceProgression } from "@/features/services/sections/ServiceProgression";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description =
  "Eight disciplines, one coherent system — web development, cloud, DevOps, security, networking, marketing, video and SEO.";

export const metadata: Metadata = {
  title: "Technology Services in Pakistan",
  description,
  alternates: {
    canonical: "/services",
  },
};

export default function Page() {
  return (
    <>
      {/* SEO-3 §21 — index page gets its own WebPage + breadcrumb only;
          the 8 individual Service entities live on their own detail
          pages, not duplicated here. */}
      <JsonLd data={webPageSchema({ path: "/services", name: "Technology Services in Pakistan", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      <ServicesHero />
      <ServiceProgression />
    </>
  );
}
