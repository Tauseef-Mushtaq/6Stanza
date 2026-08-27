import { siteConfig, socialLinks } from "@/config/site";
import type { LegalDocument } from "@/features/legal/data/types";

/**
 * Terms of Service content. Scoped to what this site actually is: a
 * marketing/lead-generation website with a project-inquiry form and a
 * consultation-booking calendar — not an e-commerce checkout, not a
 * SaaS product with its own paying end-users. No claims here about
 * payment terms, refunds, or a product EULA, since none of that
 * exists in the codebase; actual service engagements are governed by
 * a separate agreement signed once a project is scoped (noted below),
 * not by these website terms.
 */
export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  effectiveDate: "August 27, 2026",
  intro:
    `These Terms of Service ("Terms") govern your use of ${siteConfig.url.replace("https://", "")} (the "Site"), operated by ${siteConfig.legalName} ("${siteConfig.name}", "we", "us"). By accessing or using the Site, you agree to these Terms. If you don't agree, please don't use the Site.`,
  sections: [
    {
      id: "use-of-site",
      heading: "Use of the Site",
      blocks: [
        "You may use this Site to learn about our services, review our work, and start a conversation about a potential project. You agree to use the Site only for lawful purposes and not to:",
        [
          "Attempt to gain unauthorized access to any part of the Site, our admin systems, or our data.",
          "Submit false, misleading, or fraudulent information through any form on the Site.",
          "Use automated means (bots, scrapers) to submit forms or extract content at scale.",
          "Interfere with the Site's normal operation or security.",
        ],
      ],
    },
    {
      id: "project-inquiries",
      heading: "Project Inquiries & Consultations",
      blocks: [
        "Submitting the \"Start a Project\" form, using the Smart Project Discovery tool, or booking a consultation call is an expression of interest — it does not create a contract, engagement, or obligation on either side.",
        "Any recommendation shown by the Smart Project Discovery tool is an automated, rule-based suggestion meant to help you think through your project. It is not professional or technical advice, and it is not binding — you're free to select any services you like on the full project form regardless of what was suggested.",
        "An actual working relationship — scope, pricing, timeline, and deliverables — is only formed once both parties sign a separate, dedicated agreement covering that engagement. These Terms govern the website only, not any resulting project work.",
      ],
    },
    {
      id: "accounts",
      heading: "Accounts",
      blocks: [
        "Parts of this Site (the admin dashboard) require an account and are restricted to authorized personnel. You're responsible for keeping your account credentials confidential and for all activity under your account. Notify us immediately if you suspect unauthorized use.",
      ],
    },
    {
      id: "intellectual-property",
      heading: "Intellectual Property",
      blocks: [
        `All content on this Site — including text, graphics, logos, project case studies, and the design and code of the Site itself — is owned by ${siteConfig.legalName} or its licensors and is protected by applicable intellectual property laws, unless otherwise noted.`,
        "You may view and share content from this Site for personal, non-commercial reference. You may not reproduce, redistribute, or use our content, branding, or case-study material for commercial purposes without our prior written permission.",
      ],
    },
    {
      id: "third-party-links",
      heading: "Third-Party Links & Services",
      blocks: [
        "This Site links to and embeds third-party services, including a consultation-booking calendar (Cal.com) and WhatsApp. Your use of those services is governed by their own terms and privacy policies, not ours — we aren't responsible for their content, availability, or practices.",
      ],
    },
    {
      id: "disclaimers",
      heading: "Disclaimers",
      blocks: [
        "This Site, and everything on it, is provided \"as is\" and \"as available,\" without warranties of any kind, whether express or implied — including, without limitation, warranties of merchantability, fitness for a particular purpose, or non-infringement.",
        "We make reasonable efforts to keep this Site accurate and available but do not guarantee it will be error-free, uninterrupted, or secure at all times.",
      ],
    },
    {
      id: "limitation-of-liability",
      heading: "Limitation of Liability",
      blocks: [
        `To the fullest extent permitted by law, ${siteConfig.legalName} will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, this Site.`,
      ],
    },
    {
      id: "governing-law",
      heading: "Governing Law",
      blocks: [
        `These Terms are governed by the laws applicable to ${siteConfig.legalName}'s place of incorporation, without regard to conflict-of-law principles. Any dispute arising from these Terms or the Site will be subject to the exclusive jurisdiction of the courts in that location.`,
      ],
    },
    {
      id: "changes",
      heading: "Changes to These Terms",
      blocks: [
        "We may update these Terms from time to time. We'll update the \"Last updated\" date above when we do. Continuing to use the Site after changes are posted means you accept the revised Terms.",
      ],
    },
    {
      id: "contact",
      heading: "Contact Us",
      blocks: [
        `Questions about these Terms can be sent to ${socialLinks.email} or through the WhatsApp link in our site footer.`,
      ],
    },
  ],
};
