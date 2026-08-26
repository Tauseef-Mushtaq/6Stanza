"use client";

/**
 * Minimal-integration-ready choice for Consultation Booking v1: this
 * project has no existing calendar/booking integration (confirmed by
 * inspecting `package.json` and the full repository tree before
 * writing any of this module — see
 * `MODULE-CONSULTATION-BOOKING-1-HANDOFF.md`), and the brief is
 * explicit that a full custom calendar system is out of scope. Rather
 * than add a new npm dependency for a single embed, this uses Cal.com's
 * official vanilla-JS "queue" snippet
 * (https://cal.com/docs/core-features/embed/embed-snippet) — it's the
 * same snippet Cal.com's own docs/`@calcom/embed-react` wrap, just
 * without the extra package. Loaded once, lazily, only when a
 * consultation-booking surface actually mounts.
 */

type CalApi = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  loaded?: boolean;
  ns?: Record<string, CalApi>;
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

let loadPromise: Promise<CalApi> | null = null;

export function loadCalApi(): Promise<CalApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadCalApi can only run in the browser."));
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<CalApi>((resolve, reject) => {
    // Official queueing shim: calls made before the real script
    // finishes loading are queued on `Cal.q` and flushed once it's
    // ready, so callers don't need to wait on this promise for every
    // single `cal(...)` call — only to know the script is on the page.
    if (!window.Cal) {
      const queue: unknown[][] = [];
      const cal = ((...args: unknown[]) => {
        queue.push(args);
      }) as CalApi;
      cal.q = queue;
      cal.loaded = false;
      window.Cal = cal;
    }

    if (window.Cal.loaded) {
      resolve(window.Cal);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-cal-embed]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Cal as CalApi));
      existing.addEventListener("error", () => reject(new Error("Failed to load the booking script.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.dataset.calEmbed = "true";
    script.onload = () => {
      if (window.Cal) window.Cal.loaded = true;
      resolve(window.Cal as CalApi);
    };
    script.onerror = () => reject(new Error("Failed to load the booking script."));
    document.head.appendChild(script);
  });

  return loadPromise;
}
