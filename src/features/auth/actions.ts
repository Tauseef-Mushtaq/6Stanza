"use server";

import { redirect } from "next/navigation";
import { signUp, signIn, signOut, forgotPassword, resetPassword } from "@/lib/services/authService";
import type { AuthResult } from "@/lib/services/authService";
import type { SignUpInput, SignInInput, ForgotPasswordInput, ResetPasswordInput } from "@/lib/validation/auth";

/** Thin Server Action wrapper — `authService` owns validation/error mapping (mirrors `submitProjectInquiryAction`). */
export async function signUpAction(input: SignUpInput): Promise<AuthResult> {
  return signUp(input);
}

export async function signInAction(input: SignInInput): Promise<AuthResult> {
  return signIn(input);
}

/** Thin Server Action wrapper for `ForgotPasswordForm.tsx` — see `authService.forgotPassword`'s doc comment for why this always resolves `{ ok: true }` on a well-formed email. */
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<AuthResult> {
  return forgotPassword(input);
}

/**
 * Thin Server Action wrapper for `ResetPasswordForm.tsx`. Redirects to
 * `/login?reset=success` on success, matching that component's own
 * doc comment ("On success, resetPasswordAction redirects...") — the
 * form only ever sees this action return on a *failure*, which is why
 * its own success branch is unreachable/unnecessary in the happy path.
 */
export async function resetPasswordAction(input: ResetPasswordInput): Promise<AuthResult> {
  const result = await resetPassword(input);
  if (result.ok) {
    redirect("/login?reset=success");
  }
  return result;
}

/**
 * Logout is a Server Action rather than a client-side token clear
 * (spec §4 — "do not simply delete a client-side token and call that
 * authentication"): `signOut()` invalidates the session server-side,
 * and this redirects afterward so there's no intermediate render of a
 * stale authenticated page.
 */
export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/");
}

/**
 * Alias for `signOutAction`. Some part of this codebase (a
 * `Header.tsx` version not included in the Module 5B patch — see
 * MODULE-5B-HANDOFF.md's note on the Module 7A brief) imports this
 * function under the name `logoutAction` instead. Kept as a plain
 * re-export, not a duplicate implementation, so there's exactly one
 * sign-out code path regardless of which name a caller uses.
 */
export const logoutAction = signOutAction;
