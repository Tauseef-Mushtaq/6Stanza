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
 *
 * Module 7A: added `Relationships: []` to every table and empty
 * `Views`/`Functions` maps to the schema. The installed
 * `@supabase/postgrest-js` version's `GenericTable`/`GenericSchema`
 * types require these keys to exist (even when empty) for the
 * `Database` generic to resolve `Insert`/`Update`/`Row` correctly on
 * `.from(...)` calls — without them every insert/update call resolved
 * to `never`, which is a real generator output shape this hand-written
 * file was simply missing, not a behavior change to the schema itself.
 *
 * Module 9A: added `services`/`projects`/`team_members`/`insights`
 * (supabase/migrations/0005_cms_content.sql) and `ContentStatus`.
 *
 * Module 9K: added `project_media` (0006_project_media.sql) for the
 * Project gallery — the one content type with a genuine multi-image
 * relation. No other table changed: `media_path`/`image_path` on
 * `services`/`projects`/`team_members`/`insights` are unchanged.
 *
 * Module Consultation Booking 1: added `consultation_bookings`
 * (0010_consultation_bookings.sql) — written only by the Cal.com
 * webhook route handler via the service-role client, never by any
 * anon/authenticated request. See that migration's header comment.
 */

export type InquiryStatus = "new" | "in_progress" | "resolved" | "archived";
export type ProfileRole = "user" | "admin";
export type ContentStatus = "draft" | "published" | "archived";

/** Loosely-typed JSON column shape, matching what `@supabase/postgrest-js` expects for `jsonb` columns. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Matches `ProjectDetail.architecture` (src/features/projects/data/projectDetails.ts) — `projects.architecture` jsonb shape. */
export interface ProjectArchitectureGroup {
  label: string;
  items: string[];
}

/** Matches `TeamMember.socialLinks` (src/features/home/data/team.ts) — `team_members.social_links` jsonb shape. */
export interface TeamMemberSocialLink {
  label: string;
  href: string;
}

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
          // `role` re-added here for the user-management admin module
          // (`lib/repositories/profiles.ts#updateProfileRole`) — this
          // *is* the "future admin module's own privileged path" the
          // comment below used to describe. The DB-level backstop is
          // unchanged: `profiles_enforce_role_immutable`
          // (0001_profiles.sql) still raises unless the calling
          // session is `is_admin()`, regardless of what this type
          // permits — this type change alone grants no capability the
          // trigger doesn't independently allow.
          role?: ProfileRole;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      consultation_bookings: {
        Row: {
          id: string;
          cal_booking_uid: string;
          event_type_slug: string;
          attendee_name: string;
          attendee_email: string;
          project_inquiry_id: string | null;
          starts_at: string;
          ends_at: string;
          status: InquiryStatus;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          cal_booking_uid: string;
          event_type_slug: string;
          attendee_name: string;
          attendee_email: string;
          project_inquiry_id?: string | null;
          starts_at: string;
          ends_at: string;
          status?: InquiryStatus;
          raw_payload: Json;
        };
        Update: {
          status?: InquiryStatus;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          short_description: string;
          tags: string[];
          icon_key: string;
          problem: string | null;
          capabilities: string[];
          architecture: string[];
          principles: number[];
          media_path: string | null;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          slug: string;
          name: string;
          category: string;
          short_description: string;
          tags?: string[];
          icon_key: string;
          problem?: string | null;
          capabilities?: string[];
          architecture?: string[];
          principles?: number[];
          media_path?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          category?: string;
          short_description?: string;
          tags?: string[];
          icon_key?: string;
          problem?: string | null;
          capabilities?: string[];
          architecture?: string[];
          principles?: number[];
          media_path?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          description: string;
          technologies: string[];
          outcome: string;
          accent: number;
          positioning: string | null;
          overview_summary: string | null;
          overview_contribution: string | null;
          challenge: string | null;
          solution: string | null;
          architecture: ProjectArchitectureGroup[];
          outcome_statement: string | null;
          media_path: string | null;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          slug: string;
          title: string;
          category: string;
          description: string;
          technologies?: string[];
          outcome: string;
          accent?: number;
          positioning?: string | null;
          overview_summary?: string | null;
          overview_contribution?: string | null;
          challenge?: string | null;
          solution?: string | null;
          architecture?: ProjectArchitectureGroup[];
          outcome_statement?: string | null;
          media_path?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Update: {
          slug?: string;
          title?: string;
          category?: string;
          description?: string;
          technologies?: string[];
          outcome?: string;
          accent?: number;
          positioning?: string | null;
          overview_summary?: string | null;
          overview_contribution?: string | null;
          challenge?: string | null;
          solution?: string | null;
          architecture?: ProjectArchitectureGroup[];
          outcome_statement?: string | null;
          media_path?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          slug: string;
          name: string;
          role: string;
          discipline: string;
          short_bio: string;
          initials: string;
          image_path: string | null;
          social_links: TeamMemberSocialLink[];
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          slug: string;
          name: string;
          role: string;
          discipline: string;
          short_bio: string;
          initials: string;
          image_path?: string | null;
          social_links?: TeamMemberSocialLink[];
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          role?: string;
          discipline?: string;
          short_bio?: string;
          initials?: string;
          image_path?: string | null;
          social_links?: TeamMemberSocialLink[];
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          excerpt: string;
          content: Json;
          reading_time: string;
          media_path: string | null;
          status: ContentStatus;
          related_service_slug: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          slug: string;
          title: string;
          category: string;
          excerpt: string;
          content?: Json;
          reading_time: string;
          media_path?: string | null;
          status?: ContentStatus;
          related_service_slug?: string | null;
          published_at?: string | null;
        };
        Update: {
          slug?: string;
          title?: string;
          category?: string;
          excerpt?: string;
          content?: Json;
          reading_time?: string;
          media_path?: string | null;
          status?: ContentStatus;
          related_service_slug?: string | null;
          published_at?: string | null;
        };
        Relationships: [];
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
        };
        Update: {
          project_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          company: string | null;
          quote: string;
          image_path: string | null;
          project_id: string | null;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          name: string;
          role?: string | null;
          company?: string | null;
          quote: string;
          image_path?: string | null;
          project_id?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Update: {
          name?: string;
          role?: string | null;
          company?: string | null;
          quote?: string;
          image_path?: string | null;
          project_id?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          published_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
