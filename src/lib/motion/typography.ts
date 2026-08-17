"use client";

import { gsap } from "./gsap";
import { DURATION, EASE } from "./tokens";

export type SplitUnit = "lines" | "words" | "chars";

/**
 * Dependency-free text splitter (GSAP's SplitText is a paid Club GreenSock
 * plugin, so Module 2 rolls a minimal version covering what the cinematic
 * typography choreography actually needs: word- and char-level spans, plus
 * a line wrapper for masked line reveals).
 *
 * Mutates the DOM in place and returns the created span elements. Callers
 * are responsible for restoring `element.innerHTML = originalHTML` on
 * cleanup if the split is temporary (the `Reveal`/`SplitHeading` components
 * do this automatically).
 */
export function splitText(element: HTMLElement, unit: SplitUnit = "words"): HTMLElement[] {
  const text = element.textContent ?? "";

  if (unit === "chars") {
    const words = text.split(/(\s+)/);
    element.innerHTML = "";
    const spans: HTMLElement[] = [];
    words.forEach((word) => {
      if (/^\s+$/.test(word)) {
        element.appendChild(document.createTextNode(word));
        return;
      }
      const wordWrap = document.createElement("span");
      wordWrap.style.display = "inline-block";
      wordWrap.style.whiteSpace = "nowrap";
      [...word].forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity";
        wordWrap.appendChild(span);
        spans.push(span);
      });
      element.appendChild(wordWrap);
    });
    return spans;
  }

  if (unit === "words") {
    const words = text.split(/(\s+)/);
    element.innerHTML = "";
    const spans: HTMLElement[] = [];
    words.forEach((word) => {
      if (/^\s+$/.test(word)) {
        element.appendChild(document.createTextNode(word));
        return;
      }
      const span = document.createElement("span");
      span.textContent = word;
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      element.appendChild(span);
      spans.push(span);
    });
    return spans;
  }

  // "lines" — wrap the element's natural wrapped lines using a range-based
  // measurement pass, then mask each line for a clip-reveal.
  const words = text.split(/\s+/).filter(Boolean);
  element.innerHTML = "";
  const measureSpans = words.map((word) => {
    const span = document.createElement("span");
    span.textContent = word + " ";
    span.style.display = "inline-block";
    element.appendChild(span);
    return span;
  });

  const lineGroups: HTMLElement[][] = [];
  let lastTop: number | null = null;
  measureSpans.forEach((span) => {
    const top = span.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 1) {
      lineGroups.push([]);
      lastTop = top;
    }
    lineGroups[lineGroups.length - 1].push(span);
  });

  element.innerHTML = "";
  const lineEls: HTMLElement[] = [];
  lineGroups.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.style.display = "block";
    lineOuter.style.overflow = "hidden";
    const lineInner = document.createElement("span");
    lineInner.style.display = "block";
    lineInner.style.willChange = "transform, opacity";
    lineInner.textContent = group.map((s) => s.textContent).join("").trim();
    lineOuter.appendChild(lineInner);
    element.appendChild(lineOuter);
    lineEls.push(lineInner);
  });

  return lineEls;
}

export interface TypographyRevealOptions {
  unit?: SplitUnit;
  stagger?: number;
  duration?: number;
  ease?: string;
  /** Extra blur-to-sharp accent on top of the base reveal. */
  blur?: boolean;
  start?: string;
  once?: boolean;
}

/**
 * Splits `element`'s text and animates the resulting units in — line
 * reveal, word stagger, or char stagger depending on `unit`. Intended for
 * large headlines; use sparingly (spec §11 — not every heading should
 * animate character-by-character).
 */
export function createTypographyReveal(element: HTMLElement, options: TypographyRevealOptions = {}) {
  const {
    unit = "words",
    stagger = unit === "chars" ? 0.02 : unit === "lines" ? 0.12 : 0.05,
    duration = unit === "chars" ? DURATION.normal : DURATION.slow,
    ease = EASE.smooth,
    blur = unit !== "chars",
    start = "top 85%",
    once = true,
  } = options;

  const units = splitText(element, unit);
  const fromVars: gsap.TweenVars = { autoAlpha: 0, yPercent: unit === "lines" ? 110 : 60 };
  if (blur) fromVars.filter = "blur(6px)";

  const tween = gsap.fromTo(units, fromVars, {
    autoAlpha: 1,
    yPercent: 0,
    filter: blur ? "blur(0px)" : undefined,
    duration,
    ease,
    stagger,
    scrollTrigger: {
      trigger: element,
      start,
      toggleActions: once ? "play none none none" : "play reverse play reverse",
    },
  });

  return { tween, units };
}
