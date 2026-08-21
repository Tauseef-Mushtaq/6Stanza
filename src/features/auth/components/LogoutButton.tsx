"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { signOutAction } from "@/features/auth/actions";

/** Invalidates the session server-side and redirects (spec §4). */
export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
    >
      {pending ? "Signing out…" : "Sign Out"}
    </Button>
  );
}
