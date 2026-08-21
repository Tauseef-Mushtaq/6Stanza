import { z } from "zod";

/**
 * Server-side auth validation (Module 5B), matching the pattern
 * established by `lib/validation/projectInquiry.ts` (Module 5A): the
 * client can do a light check for UX, but these schemas — run inside
 * the Server Actions in `features/auth/actions.ts` — are the ones that
 * actually gate what reaches Supabase Auth.
 *
 * Password rules intentionally stay minimal (length only). Supabase
 * Auth itself is the source of truth for password acceptance; this
 * schema exists to reject obviously-invalid input early with a field
 * error instead of a round trip, not to reimplement password policy.
 */

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.").max(320),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.").max(320),
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.").max(320),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
