import type { Metadata } from "next";
import { ContactHero } from "@/features/contact/sections/ContactHero";
import { ContactDetails } from "@/features/contact/sections/ContactDetails";
import { ContactCta } from "@/features/contact/sections/ContactCta";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with 6STANZA — a lighter doorway into starting a project conversation.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactDetails />
      <ContactCta />
    </>
  );
}
