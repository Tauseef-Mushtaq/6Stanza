import type { Metadata } from "next";
import { DiscoveryPageContent } from "@/features/discovery/sections/DiscoveryPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description = "Answer a few quick questions and get a recommendation of which 6STANZA services fit your project.";

export const metadata: Metadata = {
  title: "Smart Project Discovery",
  description,
  alternates: {
    canonical: "/discovery",
  },
};

export default function DiscoveryPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/discovery", name: "Smart Project Discovery", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Smart Project Discovery", path: "/discovery" }])} />
      <DiscoveryPageContent />
    </>
  );
}
