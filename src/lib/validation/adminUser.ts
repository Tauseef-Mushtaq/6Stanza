import { z } from "zod";

/**
 * User management — role-update validation, same convention as
 * `lib/validation/adminInquiry.ts`: the Server Action layer
 * (`features/admin/actions.ts`) runs this before anything reaches the
 * service/repository layer, so a role value is never trusted just
 * because it came from a `<select>` the browser rendered.
 *
 * The literal tuple mirrors the actual `profile_role` Postgres enum
 * (`supabase/migrations/0001_profiles.sql`'s
 * `create type public.profile_role as enum ('user', 'admin')`),
 * spelled out by hand rather than derived from `ProfileRole` since zod
 * needs a literal tuple for `z.enum` — same reasoning as
 * `inquiryStatusValues`.
 */
export const profileRoleValues = ["user", "admin"] as const;

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user id."),
  role: z.enum(profileRoleValues, { message: "Invalid role." }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const deleteUserSchema = z.object({
  userId: z.string().uuid("Invalid user id."),
});
