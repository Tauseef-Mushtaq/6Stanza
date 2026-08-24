"use client";

import dynamic from "next/dynamic";

/**
 * SEO-6 (fixed post-review) — `next/dynamic(..., { ssr: false })`
 * cannot be called inside a Server Component (Next.js 16 build
 * error: "`ssr: false` is not allowed with `next/dynamic` in Server
 * Components"). `src/app/(site)/layout.tsx` is an async Server
 * Component (it awaits `getCurrentProfile()`), so the dynamic import
 * has to live in its own small Client Component instead — this file.
 *
 * Behavior is unchanged from the original SEO-6 intent: `FaqChatbot`
 * (self-contained, below-the-fold, no SEO/above-the-fold role) still
 * loads in its own chunk on the client, after hydration, rather than
 * shipping in the initial `(site)` route bundle. `SiteLayout` now
 * renders this wrapper via a plain import instead of importing
 * `next/dynamic` itself.
 */
const FaqChatbot = dynamic(() => import("@/components/ui/FaqChatbot").then((mod) => mod.FaqChatbot), {
  ssr: false,
});

export function LazyFaqChatbot() {
  return <FaqChatbot />;
}
