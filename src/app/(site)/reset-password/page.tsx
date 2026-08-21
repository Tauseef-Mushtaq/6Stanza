import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/sections/ResetPasswordForm";

export const metadata: Metadata = { title: "Set new password" };

/**
 * Deliberately does NOT redirect an "already authenticated" visitor
 * away like `/login`/`/signup`/`/forgot-password` do (spec §17) —
 * arriving here WITH a session is the intended path: `/auth/callback`
 * exchanges the recovery link's code for a real Supabase session
 * before redirecting here, so `getCurrentUser()` returning non-null on
 * this page is success, not a reason to bounce the user away from
 * finishing their password reset.
 */
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
