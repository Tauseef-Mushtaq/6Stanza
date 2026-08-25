export const siteConfig = {
  name: "6STANZA",
  legalName: "6STANZA Pvt Ltd",
  tagline: "Technology partner for Strategy, Software, Systems, Security, Scalability, Speed.",
  /**
   * Domain-alignment task — current canonical/public deployment URL.
   * The site is currently live only at the Vercel deployment below;
   * `https://6stanza.com` is the intended future custom domain, not
   * yet the active canonical target. When the custom domain goes
   * live, change this single value back (and re-verify) rather than
   * touching any of the SEO code that reads it.
   */
  url: "https://6stanza.vercel.app",
} as const;

/**
 * WhatsApp Business contact. `whatsappNumber` is E.164 digits only (no
 * "+", spaces, or dashes) since that's what the wa.me link format
 * requires. `whatsappLink()` builds the deep link, optionally with a
 * prefilled message — used by every WhatsApp entry point across the
 * site (floating button, header, footer, contact page) so the number
 * and default message only ever need to change in one place.
 */
export const whatsappNumber = "923288553087";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Official 6STANZA social/contact channels. WhatsApp is intentionally
 * excluded here (it's derived via `whatsappLink()` above, which needs
 * the optional prefilled message) — everything else a link or icon
 * row needs lives in this one object so it only changes in one place.
 */
export type SocialPlatform = "linkedin" | "tiktok" | "instagram" | "facebook" | "email" | "whatsapp";

export const socialLinks = {
  linkedin: "https://www.linkedin.com/company/6stanza/",
  tiktok: "https://www.tiktok.com/@6stanza_.official",
  instagram: "https://www.instagram.com/6stanzaofficial",
  facebook: "https://www.facebook.com/profile.php?id=61593514495213",
  email: "6stanzaofficial@gmail.com",
} as const;

