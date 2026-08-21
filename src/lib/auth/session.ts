import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, ProfileRole } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Server-side auth/authorization foundation (spec §6/§18). Every
 * function here reads the current request's Supabase session via
 * `createSupabaseServerClient()` — none of them trust a client-supplied
 * role or user id. There is no `/login` or `/signup` route in this
 * project yet (checked before writing this file — see
 * MODULE-5-HANDOFF.md §"Authentication"), so nothing calls these
 * helpers yet either; they're the foundation the future auth-UI module
 * builds on, matching this module's "prepare the backend without
 * building the polished auth UI" scope (spec §18).
 */

/** The current session's authenticated user, or `null` if anonymous. Never throws. */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The current user's `profiles` row, or `null` if anonymous or the profile row doesn't exist (shouldn't happen once the `handle_new_user` trigger has run, but the caller shouldn't assume). */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error || !data) return null;
  return data;
}

/** Throws if there's no authenticated session. Returns the Supabase auth user (not the profile) on success. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/** Throws if there's no authenticated session, or if the authenticated user's `profiles.role` isn't `"admin"`. Returns the profile on success. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("UNAUTHENTICATED");
  if (profile.role !== ("admin" satisfies ProfileRole)) throw new Error("FORBIDDEN");
  return profile;
}

/**
 * Module 6 — reusable protected-route boundary (spec §14: "make the
 * route protection mechanism reusable for future authenticated
 * pages," not a one-off demo page — none is created in this module
 * since none of the current routes need protecting yet).
 *
 * Call from the top of a protected Server Component page/layout:
 *
 *   export default async function AccountPage() {
 *     const profile = await requireProfileOrRedirect("/account");
 *     ...
 *   }
 *
 * `redirect()` throws internally (Next.js's own mechanism) — this
 * function never returns `null`/`undefined` to a caller that forgot to
 * check, it only ever returns a real profile or redirects away.
 * `currentPath` becomes `?redirect=` on `/login`, validated as a safe
 * internal path by `loginAction`/the login page before ever being used
 * (spec §17/§20) — this function itself doesn't need to validate it
 * again, but always pass the literal route path, never a client-
 * supplied value, to avoid depending on that downstream check.
 */
export async function requireProfileOrRedirect(currentPath: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
  return profile;
}
