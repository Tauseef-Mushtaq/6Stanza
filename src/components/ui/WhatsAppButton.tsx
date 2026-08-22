import { whatsappLink } from "@/config/site";

/**
 * Floating WhatsApp Business entry point, fixed to the bottom-right of
 * the viewport on every public page (mounted once in
 * `src/app/(site)/layout.tsx`). Uses `--z-overlay` so it always sits
 * above page content but below any modal (`--z-modal`). The SVG glyph
 * is drawn inline (no external icon package in this project's deps)
 * using `currentColor` so it inherits the button's text color.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hi 6STANZA, I'd like to get in touch.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with 6STANZA on WhatsApp"
      className="fixed flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      style={{
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        background: "#25D366",
        color: "#ffffff",
        zIndex: "var(--z-overlay)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="30"
        height="30"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.887.525 3.708 1.522 5.288L2 22l4.828-1.503A9.955 9.955 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.148a8.13 8.13 0 01-4.146-1.134l-.297-.176-3.075.958.985-2.998-.194-.31A8.109 8.109 0 013.85 12c0-4.5 3.652-8.148 8.15-8.148 4.499 0 8.15 3.649 8.15 8.148 0 4.5-3.651 8.148-8.149 8.148z" />
      </svg>
    </a>
  );
}
