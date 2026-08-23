export const siteConfig = {
  name: "6STANZA",
  legalName: "6STANZA Pvt Ltd",
  tagline: "Technology partner for Strategy, Software, Systems, Security, Scalability, Speed.",
  url: "https://6stanza.com",
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

