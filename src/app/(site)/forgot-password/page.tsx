import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ForgotPasswordForm } from "@/features/auth/sections/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return <ForgotPasswordForm />;
}
