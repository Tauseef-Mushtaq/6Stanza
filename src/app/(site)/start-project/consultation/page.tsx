import { Suspense } from "react";
import type { Metadata } from "next";
import { ConsultationBookingPageContent } from "@/features/consultation-booking/sections/ConsultationBookingPageContent";
import { Loader } from "@/components/ui/Loader";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description = "Book a live consultation with 6STANZA — pick a time from real, available slots.";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description,
  alternates: {
    canonical: "/start-project/consultation",
  },
};

export default function ConsultationBookingPage() {
  return (
    <>
      <JsonLd
        data={webPageSchema({ path: "/start-project/consultation", name: "Book a Consultation", description })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Start a Project", path: "/start-project" },
          { name: "Book a Consultation", path: "/start-project/consultation" },
        ])}
      />
      {/*
        `ConsultationBookingPageContent` reads `useSearchParams()` (for
        the optional name/email/inquiryId prefill from the inquiry
        success state) — the App Router requires a Suspense boundary
        around any component that does, so this route can still be
        statically rendered rather than forced fully dynamic.
      */}
      <Suspense
        fallback={
          <Container className="flex min-h-svh items-center justify-center">
            <Loader label="Loading…" showLabel size="lg" />
          </Container>
        }
      >
        <ConsultationBookingPageContent />
      </Suspense>
    </>
  );
}
