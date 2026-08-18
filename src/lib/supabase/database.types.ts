/**
 * Hand-written Supabase database types, matching the migrations in
 * `supabase/migrations/*`. These are NOT generated — this project has
 * no live Supabase project connected in this environment, and the
 * real generator needs project credentials this sandbox doesn't have:
 *
 *   npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/database.types.ts
 *
 * Run that command against the real project once it exists and this
 * file becomes generated output instead of hand-maintained — until
 * then, keep it in sync with `supabase/migrations/*` by hand. Every
 * repository in `src/lib/repositories/*` imports from here rather than
 * using `any`, so a drift here is a compile error there, not a silent
 * runtime mismatch.
 */

export type InquiryStatus = "new" | "in_progress" | "resolved" | "archived";
export type ProfileRole = "user" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: ProfileRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: ProfileRole;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          // `role` intentionally excluded — see the profiles migration's
          // `enforce_profile_role_immutable` trigger. Role changes go
          // through the future admin module's own privileged path, not
          // a generic profile update.
        };
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          status: InquiryStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          email: string;
          message: string;
        };
        Update: {
          status?: InquiryStatus;
        };
      };
      project_inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          project_title: string;
          services: string[];
          stage: string | null;
          timeline: string | null;
          budget: string | null;
          message: string;
          status: InquiryStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          email: string;
          company?: string | null;
          project_title: string;
          services: string[];
          stage?: string | null;
          timeline?: string | null;
          budget?: string | null;
          message: string;
        };
        Update: {
          status?: InquiryStatus;
        };
      };
    };
  };
}
