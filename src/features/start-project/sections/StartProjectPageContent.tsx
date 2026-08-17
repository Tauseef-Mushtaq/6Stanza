"use client";

import { useState } from "react";
import { StartProjectHero } from "@/features/start-project/sections/StartProjectHero";
import { ProjectForm } from "@/features/start-project/sections/ProjectForm";
import { SuccessState } from "@/features/start-project/sections/SuccessState";

/**
 * Client-side composition root for /start-project. Owns the single
 * piece of cross-section state (whether the form has succeeded) so
 * the route's `page.tsx` can stay a plain server component wrapper.
 */
export function StartProjectPageContent() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return <SuccessState />;

  return (
    <>
      <StartProjectHero />
      <ProjectForm onSuccess={() => setSubmitted(true)} />
    </>
  );
}
