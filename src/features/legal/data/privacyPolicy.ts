import { siteConfig, socialLinks } from "@/config/site";
import type { LegalDocument } from "@/features/legal/data/types";

/**
 * Privacy Policy content. Written to match what this codebase
 * actually does — no data collection, cookie, or third-party claim
 * here that isn't backed by real code:
 *
 * - Project inquiries: `src/features/start-project` → `submitProjectInquiryAction`
 *   → `contact_inquiries`/`project_inquiries` tables (Supabase Postgres).
 * - Consultation booking: `src/features/consultation-booking` embeds
 *   Cal.com and records confirmed bookings via
 *   `src/app/api/webhooks/cal-booking/route.ts`.
 * - Accounts: Supabase Auth (email/password), used for the admin
 *   dashboard — see `src/lib/auth`.
 * - Media: Supabase Storage, for CMS-uploaded images only, not visitor data.
 * - No analytics, advertising, or tracking scripts exist anywhere in
 *   the codebase at the time this was written (verified: no
 *   `gtag`/Google Analytics/ad-pixel code present).
 *
 * This is a solid factual starting point, not a substitute for legal
 * review — see the module handoff for what to confirm with counsel
 * before this goes live (registered address, applicable jurisdiction,
 * data-retention specifics).
 */
export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  effectiveDate: "August 27, 2026",
  intro:
    `This Privacy Policy explains what information ${siteConfig.legalName} ("${siteConfig.name}", "we", "us") collects through ${siteConfig.url.replace("https://", "")}, why we collect it, and the choices you have. By using this website, you agree to the practices described here.`,
  sections: [
    {
      id: "information-we-collect",
      heading: "Information We Collect",
      blocks: [
        "We collect information you provide directly to us, and a limited amount of information generated automatically by your use of the site.",
        [
          "Project inquiries — when you submit the \"Start a Project\" form: your name, email address, company (optional), a short project title, the services you're interested in, project stage, timeline, budget range, and your message.",
          "Consultation bookings — if you schedule a call through our booking calendar (provided by Cal.com), your name, email address, and any notes you add. The confirmed booking time is recorded on our side once Cal.com notifies us.",
          "Account information — if you're issued an account to access the admin area, your email address and authentication credentials, handled by our authentication provider (Supabase Auth). We do not offer public account signup for general visitors.",
          "Automatically collected information — standard technical data your browser sends to any website you visit (such as IP address and browser type), used only for security, debugging, and keeping the site running reliably.",
        ],
        "We do not ask for, and you should not send us, sensitive information such as government ID numbers, payment card details, or health information through any form on this site.",
      ],
    },
    {
      id: "how-we-use-information",
      heading: "How We Use Your Information",
      blocks: [
        "We use the information described above to:",
        [
          "Respond to project inquiries and consultation requests.",
          "Schedule, confirm, and follow up on consultation calls.",
          "Operate, secure, and improve the website and our admin systems.",
          "Communicate with you about a project or inquiry you've started with us.",
        ],
        "We do not sell your information, and we do not use it for advertising or third-party marketing.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies & Similar Technologies",
      blocks: [
        "This site uses only the essential cookies needed to make it work — specifically, session cookies set by our authentication provider (Supabase) to keep administrators signed in to the admin dashboard. These are not used to track visitors across other websites.",
        "We do not currently use analytics, advertising, or third-party tracking cookies. If that changes in the future, this policy will be updated accordingly, and we'll seek any consent required by law before doing so.",
      ],
    },
    {
      id: "third-party-services",
      heading: "Third-Party Services",
      blocks: [
        "We rely on a small number of service providers to run this website, each of which processes data on our behalf under its own privacy terms:",
        [
          "Supabase — hosts our database, handles authentication, and stores uploaded media.",
          "Cal.com — powers our consultation-booking calendar and processes the booking details you enter there.",
          "Vercel — hosts and serves the website.",
          "WhatsApp (Meta) — if you choose to contact us via the WhatsApp link on this site, that conversation is subject to WhatsApp's own privacy policy, not this one.",
        ],
        "We choose providers that we believe handle data responsibly, but we encourage you to review their respective privacy policies for details on how they process information.",
      ],
    },
    {
      id: "data-retention",
      heading: "Data Retention",
      blocks: [
        "We retain project inquiries, consultation bookings, and related correspondence for as long as reasonably necessary to respond to you, deliver services, and meet our legal and accounting obligations. You can ask us to delete information you've submitted at any time — see \"Your Rights & Choices\" below.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your Rights & Choices",
      blocks: [
        "Depending on where you're located, you may have rights to access, correct, or request deletion of the personal information we hold about you, or to object to certain uses of it.",
        "To exercise any of these rights, contact us using the details below. We'll respond within a reasonable timeframe.",
      ],
    },
    {
      id: "data-security",
      heading: "Data Security",
      blocks: [
        "We use reasonable technical and organizational measures — including database-level access controls and encrypted connections — to protect the information we hold. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      id: "childrens-privacy",
      heading: "Children's Privacy",
      blocks: [
        "This website is intended for businesses and individuals seeking technology services, not children. We do not knowingly collect personal information from anyone under the age of 18. If you believe a child has provided us with personal information, please contact us and we'll remove it.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to This Policy",
      blocks: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We'll update the \"Last updated\" date above when we do, and material changes will be reflected on this page.",
      ],
    },
    {
      id: "contact",
      heading: "Contact Us",
      blocks: [
        `If you have questions about this Privacy Policy or how we handle your information, contact us at ${socialLinks.email} or through the WhatsApp link in our site footer.`,
      ],
    },
  ],
};
