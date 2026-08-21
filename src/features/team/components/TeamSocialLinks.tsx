import type { TeamMember } from "@/features/home/data/team";

/**
 * Module 9N — renders a Team member's CMS `socialLinks` (already
 * validated/normalized to `{ label, href }[]` in `publicTeam.ts`) as a
 * row of recognizable platform icons, reusing the existing
 * typography/spacing/hover tokens rather than introducing a new icon
 * package. Platform is detected from the free-text `label` the admin
 * enters (spec §3 — the CMS has no fixed platform enum), matched
 * case-insensitively against common platform names; anything
 * unrecognized still renders as a labeled external-link icon rather
 * than being dropped, since the href is still a real, working link.
 *
 * Renders nothing when there are no links (spec §25 — no empty
 * container).
 */
export function TeamSocialLinks({ links, className }: { links: TeamMember["socialLinks"]; className?: string }) {
  if (!links || links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:text-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            <SocialIcon label={link.label} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function SocialIcon({ label }: { label: string }) {
  const key = label.trim().toLowerCase();
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", "aria-hidden": true as const, focusable: false as const };

  if (key.includes("linkedin")) {
    return (
      <svg {...common} fill="currentColor">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.33V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
      </svg>
    );
  }
  if (key.includes("github")) {
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.53 9.53 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
      </svg>
    );
  }
  if (key.includes("twitter") || key === "x" || key.includes(" x") || key.startsWith("x/")) {
    return (
      <svg {...common} fill="currentColor">
        <path d="M18.24 3H21l-6.55 7.49L22.2 21h-6.06l-4.75-6.2L5.9 21H3.13l7.01-8.02L1.8 3h6.21l4.29 5.67L18.24 3zm-1.06 16.2h1.68L7.9 4.72H6.1l11.08 14.48z" />
      </svg>
    );
  }
  if (key.includes("instagram")) {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key.includes("facebook")) {
    return (
      <svg {...common} fill="currentColor">
        <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3A21 21 0 0 0 14.3 4c-2.4 0-4 1.46-4 4.14v2.36H7.8v3h2.5V21h3.2z" />
      </svg>
    );
  }
  // Generic "website / other link" fallback — globe icon.
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}
