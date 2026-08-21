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
};

export default nextConfig;
