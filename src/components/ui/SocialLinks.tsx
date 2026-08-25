import { socialLinks, whatsappLink, type SocialPlatform } from "@/config/site";

/**
 * Inline SVG glyphs for each social platform. Drawn by hand (no
 * external icon package in this project's deps — same approach as
 * `WhatsAppButton.tsx`) using `currentColor` so each glyph inherits
 * whatever text color its wrapping link is given.
 */
const icons: Record<SocialPlatform, React.ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.451 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.941v5.665H9.355V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 01-3.14-1.34 4.29 4.29 0 01-1.14-2.65h-3.3v13.6a2.6 2.6 0 01-4.68 1.57 2.6 2.6 0 01.87-3.83 2.57 2.57 0 011.34-.36c.18 0 .35.02.52.05v-3.34a5.94 5.94 0 00-.52-.02A5.94 5.94 0 003 15.4a5.94 5.94 0 009.9 4.42 5.9 5.9 0 001.83-4.27V9.4a7.55 7.55 0 004.4 1.4V7.5a4.25 4.25 0 01-2.53-1.68z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.325C24 .593 23.407 0 22.675 0z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="M3.5 6.5l8.5 6 8.5-6" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.887.525 3.708 1.522 5.288L2 22l4.828-1.503A9.955 9.955 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.148a8.13 8.13 0 01-4.146-1.134l-.297-.176-3.075.958.985-2.998-.194-.31A8.109 8.109 0 013.85 12c0-4.5 3.652-8.148 8.15-8.148 4.499 0 8.15 3.649 8.15 8.148 0 4.5-3.651 8.148-8.149 8.148z" />
    </svg>
  ),
};

type SocialLinksProps = {
  /** Icon square size in px. Defaults to 18. */
  size?: number;
  /** Extra classes for each link's wrapping <a>. */
  className?: string;
};

/**
 * Renders the full social row (LinkedIn, TikTok, Instagram, Facebook,
 * WhatsApp, Email) sourced from `siteConfig`'s `socialLinks`. Used in
 * the footer (icon row) and can be reused anywhere else the same set
 * is needed — colors/size are controlled by the caller via `className`
 * so it adapts to light/dark contexts.
 */
export function SocialLinks({ size = 18, className = "" }: SocialLinksProps) {
  const entries: { platform: SocialPlatform; href: string; label: string }[] = [
    { platform: "linkedin", href: socialLinks.linkedin, label: "6STANZA on LinkedIn" },
    { platform: "instagram", href: socialLinks.instagram, label: "6STANZA on Instagram" },
    { platform: "tiktok", href: socialLinks.tiktok, label: "6STANZA on TikTok" },
    { platform: "facebook", href: socialLinks.facebook, label: "6STANZA on Facebook" },
    { platform: "whatsapp", href: whatsappLink("Hi 6STANZA, I'd like to get in touch."), label: "Chat with 6STANZA on WhatsApp" },
    { platform: "email", href: `mailto:${socialLinks.email}`, label: "Email 6STANZA" },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {entries.map(({ platform, href, label }) => (
        <a
          key={platform}
          href={href}
          target={platform === "email" ? undefined : "_blank"}
          rel={platform === "email" ? undefined : "noopener noreferrer"}
          aria-label={label}
          className="transition-colors hover:text-[var(--color-brand)]"
          style={{ width: size, height: size }}
        >
          {icons[platform]}
        </a>
      ))}
    </div>
  );
}
