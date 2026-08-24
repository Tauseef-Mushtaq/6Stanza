import type { Metadata } from "next";
import { StartProjectPageContent } from "@/features/start-project/sections/StartProjectPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description = "Tell 6STANZA what you're building — start a real project conversation.";

export const metadata: Metadata = {
  title: "Start a Project",
  description,
  alternates: {
    canonical: "/start-project",
  },
};

export default function StartProjectPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/start-project", name: "Start a Project", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Start a Project", path: "/start-project" }])} />
      <StartProjectPageContent />
    </>
  );
}
