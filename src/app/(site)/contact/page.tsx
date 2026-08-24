import type { Metadata } from "next";
import { ContactHero } from "@/features/contact/sections/ContactHero";
import { ContactDetails } from "@/features/contact/sections/ContactDetails";
import { ContactCta } from "@/features/contact/sections/ContactCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description = "Get in touch with 6STANZA — a lighter doorway into starting a project conversation.";

export const metadata: Metadata = {
  title: "Contact Us",
  description,
  alternates: {
    canonical: "/contact",
  },
};

/**
 * SEO-3 §24 — no PostalAddress/telephone/openingHours here: none of
 * that was invented anywhere else in the project (contact info was
 * deliberately left unpublished — see MODULE-SEO-1-HANDOFF.md and
 * ContactDetails.tsx), so this stays a plain WebPage rather than a
 * ContactPage/LocalBusiness type that would imply fields not present.
 */
export default function ContactPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/contact", name: "Contact Us", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <ContactHero />
      <ContactDetails />
      <ContactCta />
    </>
  );
}
