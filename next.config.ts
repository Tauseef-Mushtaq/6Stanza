import type { NextConfig } from "next";

/**
 * Module 9K — two additions, both required for real image uploads to
 * actually work end-to-end (spec §2's inspection step: this file was
 * still the bare-bones default before this module, even though
 * `TeamSequence.tsx`/`TeamFocus.tsx` have used `next/image` against a
 * Supabase Storage URL since Module 9H — that only ever worked in
 * this sandbox because no real image had been uploaded yet to
 * actually hit the missing `images.remotePatterns` allowlist).
 *
 * `images.remotePatterns` — `next/image` refuses to optimize a remote
 * URL whose host isn't explicitly allowed. Every public media URL
 * this project produces (`lib/cms/media.ts`'s `getPublicMediaUrl`,
 * used by the Team public adapter and now `publicProjects.ts`'s
 * gallery mapping) is a `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/...`
 * URL, so the Supabase project's own hostname needs to be allowed.
 * Falls back to a `*.supabase.co` wildcard when the env var isn't set
 * at config-eval time, so the build doesn't hard-fail without it.
 *
 * `experimental.serverActions.bodySizeLimit` — Server Actions default
 * to a 1MB request body limit; `validateImageFile` allows images up
 * to 5MB (`lib/validation/media.ts`), so the raw multipart body
 * (which adds its own boundary/header overhead on top of the file
 * bytes) needs more headroom than the default, or every upload near
 * the validation limit would be rejected by Next.js before
 * `uploadMediaAction` ever saw it.
 */
const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname ?? "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  /**
   * Module 10F — baseline security headers (spec: "audit response
   * headers for anything missing"). Applied to every route, admin
   * included, since these are safe defaults with no known conflict
   * with GSAP/Lenis/R3F/Supabase/next/image.
   *
   * Deliberately NOT adding a `Content-Security-Policy` here — this
   * app inlines styles/scripts in a few places (React inline styles,
   * Next's own hydration script) and a CSP written without the
   * ability to actually load the site in a browser to verify against
   * real console violations is more likely to silently break the app
   * than to add real protection. Flagged in the handoff as follow-up
   * work for whoever has a live environment to iterate a CSP against.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
