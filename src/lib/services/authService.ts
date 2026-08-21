import "server-only";

import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<string, string>>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

/**
 * Maps a Supabase Auth error to a human-readable message safe to show
 * a user (spec §11/§12 — never expose provider/database internals).
 * Supabase's error `message` strings are stable enough to pattern-match
 * on for the common cases; anything unrecognized falls back to a
 * generic message rather than leaking the raw provider text.
 */
function mapAuthError(rawMessage: string, context: "signup" | "signin"): string {
  const msg = rawMessage.toLowerCase();

  if (context === "signup" && msg.includes("already registered")) {
    return "This email is already registered.";
  }
  if (context === "signup" && msg.includes("password")) {
    return "Password does not meet the minimum requirements.";
  }
  if (context === "signin" && (msg.includes("invalid login credentials") || msg.includes("invalid credentials"))) {
    return "Invalid email or password.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return context === "signup"
    ? "Unable to create your account. Please try again."
    : "Unable to sign in. Please try again.";
}

/**
 * Creates a new auth.users row via Supabase Auth. The `profiles` row
 * is created automatically by the `handle_new_user` trigger (Module
 * 5A, `supabase/migrations/0001_profiles.sql`) — nothing here inserts
 * into `profiles` directly, so there's no duplicate-profile risk and
 * this function is safe to retry (Supabase itself rejects a second
 * signup for an already-registered, confirmed email).
 *
 * `full_name` is passed as user metadata; `handle_new_user` reads it
 * (`raw_user_meta_data ->> 'full_name'`) into `profiles.display_name`.
 */
export async function signUp(raw: unknown): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("signUp: Supabase auth error", error);
    return { ok: false, message: mapAuthError(error.message, "signup") };
  }

  return { ok: true };
}

/** Signs a user in, establishing a session cookie via the request-scoped Supabase server client. */
export async function signIn(raw: unknown): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("signIn: Supabase auth error", error);
    return { ok: false, message: mapAuthError(error.message, "signin") };
  }

  return { ok: true };
}

/**
 * Sends a password-reset email via Supabase Auth. Always resolves
 * `{ ok: true }` on a well-formed email, whether or not an account
 * exists for it — Supabase Auth itself doesn't distinguish
 * "no such user" from "reset email sent" in its response for this
 * call, so there is no secret to leak here; `ForgotPasswordForm.tsx`
 * (fixed here, previously importing a function that didn't exist)
 * relies on that same "always show the generic sent-message" behavior
 * on its own success path.
 */
export async function forgotPassword(raw: unknown): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    // Logged, not surfaced — see the doc comment above for why the
    // caller always gets the same generic success regardless.
    console.error("forgotPassword: Supabase auth error", error);
  }

  return { ok: true };
}

/**
 * Updates the password for the currently-recovering session (the one
 * `/auth/callback` establishes from a password-reset link — spec §13:
 * "use Supabase Auth's supported recovery mechanism," no custom token
 * handling here). If there's no valid recovery session, `updateUser`
 * itself fails and that becomes a normal auth error to the caller.
 */
export async function resetPassword(raw: unknown): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    console.error("resetPassword: Supabase auth error", error);
    return { ok: false, message: "Unable to update your password. Please request a new reset link and try again." };
  }

  return { ok: true };
}

/** Invalidates the current session server-side (not just a client-side token drop — spec §4). */
export async function signOut(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("signOut: Supabase auth error", error);
    return { ok: false, message: "Unable to sign out. Please try again." };
  }

  return { ok: true };
}
