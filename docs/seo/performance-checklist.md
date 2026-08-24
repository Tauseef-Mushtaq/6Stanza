# 6STANZA Performance Checklist

Repeatable checklist for future releases. Check items against a real
build/live environment — this checklist does not replace measurement.

## Before deployment

- [ ] `npm run build` completes with no unexpected new route-chunk size
- [ ] `npm run lint` and `npx tsc --noEmit` pass
- [ ] Any new `"use client"` component that isn't interaction-critical
      or above-the-fold is a candidate for `next/dynamic(..., { ssr:
      false })` — ask "does this need to be in the initial bundle?"
- [ ] Any new heavy dependency (animation, 3D, rich text, charting,
      icon set) is scoped to the routes that use it, not imported
      globally
- [ ] Any new image goes through `next/image` with explicit
      `width`/`height` or a sized `fill` container — never a bare `<img>`
- [ ] Only a confirmed LCP element (not a guess) gets `priority`
- [ ] New animations prefer `transform`/`opacity`; avoid animating
      `top`/`left`/`width`/`height`/`margin`/`padding` when a transform
      alternative exists
- [ ] New scroll/animation code goes through the existing
      `src/lib/motion/gsap.ts` + `src/lib/motion/lenis.ts` singletons —
      never a second `gsap.registerPlugin()` or `new Lenis()` call
- [ ] New 3D content is viewport-gated and reduced-motion-gated, the
      same way `CinematicCanvasScene` already is
- [ ] New Supabase reads select only the columns the calling page
      actually renders, especially for list/index views

## After deployment

- [ ] Run PageSpeed Insights (mobile + desktop) against the live
      production URL, not a local/preview build
- [ ] Compare Lab data (Lighthouse) against Field data (CrUX / real
      user data) once enough traffic exists — don't treat a good lab
      score as a substitute for field data
- [ ] Spot-check Core Web Vitals: LCP, INP, CLS against Google's
      current published "good" thresholds
- [ ] Re-run the SEO regression check (metadata, canonical, sitemap,
      robots, structured data still intact — see SEO-1/SEO-3 handoffs)

## Mobile

- [ ] Test on an actual throttled/mid-tier profile, not just a resized
      desktop browser window
- [ ] Confirm the mobile nav, forms, and horizontal scroll galleries
      remain responsive to input (INP) under throttling
- [ ] Confirm WebGL scenes degrade or stay off on low-power devices
      rather than forcing full effects

## Desktop

- [ ] Confirm cinematic scroll (Lenis + ScrollTrigger) stays smooth
      with dev tools open / CPU throttled 4x, as a rough proxy for
      lower-end hardware

## Images

- [ ] No image below the fold loads eagerly
- [ ] Gallery/CMS-driven image sets load progressively, not all at once
- [ ] No oversized source image (check actual delivered dimensions vs.
      rendered dimensions)

## Fonts

- [ ] If real brand font files are ever introduced, only load the
      weights actually used, via `next/font/local`, with
      `font-display: swap` (or equivalent) — re-open this checklist
      item the day that happens; it does not apply to the current
      system-font setup

## JavaScript

- [ ] No duplicate RAF loop / duplicate scroll listener introduced
- [ ] Route-level JS didn't grow without a corresponding feature reason
- [ ] `select("*")` reads on public list pages re-checked against what
      the page actually renders (see SEO-6's `insights.content`
      finding — a documented, not-yet-fixed over-fetch)

## Animations

- [ ] New reveal/parallax/pin effects tested with
      `prefers-reduced-motion: reduce` enabled — reduced motion should
      still leave content readable and navigation/forms functional

## WebGL

- [ ] New 3D scenes mount only when in viewport
- [ ] New 3D scenes are skipped entirely under reduced motion
- [ ] DPR is capped, not left uncapped, for any new canvas

## Core Web Vitals

- [ ] LCP, INP, CLS all reviewed post-deploy, not just at build time
- [ ] Any regression traced to Problem → Root cause → Change →
      Expected effect → Measured result, the same format used in
      `docs/seo/performance.md`

## SEO regression

- [ ] Metadata, canonical tags, sitemap, robots.txt, and structured
      data all still present and unchanged by any performance work
      (see SEO-1/SEO-3 for what "correct" looks like)
