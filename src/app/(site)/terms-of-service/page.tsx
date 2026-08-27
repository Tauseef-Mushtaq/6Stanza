import type { Metadata } from "next";
import { LegalDocumentPage } from "@/features/legal/components/LegalDocumentPage";
import { termsOfService } from "@/features/legal/data/termsOfService";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description = "The terms that govern your use of the 6STANZA website.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/terms-of-service", name: "Terms of Service", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms-of-service" }])} />
      <LegalDocumentPage document={termsOfService} />
    </>
  );
}
