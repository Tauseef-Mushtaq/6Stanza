import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { absoluteUrl, defaultOgImage } from "@/lib/seo/canonical";

/**
 * SEO-1 — root metadata defaults (Next.js Metadata API), inherited by
 * every route unless a page overrides a field. `metadataBase` anchors
 * every relative OG/Twitter image and every `alternates.canonical` an
 * individual page sets to the real production origin
 * (`siteConfig.url` — https://6stanza.com), never the demo Vercel
 * deployment, regardless of which environment actually served the
 * request. `robots` defaults to fully indexable; individual
 * private/internal pages (`/admin`, `/account`, `/login`, etc.)
 * override this with `robots: { index: false, follow: false }`.
 */
export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Technology Partner for Strategy, Software & Systems`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.tagline,
    url: absoluteUrl("/"),
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.tagline,
    images: [defaultOgImage],
  },
};

/**
 * Module 8 fix — this now only provides the document shell
 * (`<html>/<body>` + skip-link) shared by every route, admin
 * included. The public marketing chrome (Header/Footer/Lenis) that
 * used to render here unconditionally now lives in
 * `src/app/(site)/layout.tsx` instead, so it only wraps public
 * routes — see that file's doc comment for why. `/admin/*` gets this
 * shell plus its own `AdminLayout`, nothing else.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-brand)] focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
