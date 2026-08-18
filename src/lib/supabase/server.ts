import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Per-request Supabase client for Server Components/Actions/Route
 * Handlers — anon key, but authenticated as whichever user's session
 * cookie is on the incoming request (if any). This is the client
 * every RLS-respecting server operation should use: `requireUser`/
 * `requireAdmin`/`getCurrentProfile` (`src/lib/auth/session.ts`) and
 * every repository under `src/lib/repositories/*` are built on this,
 * not on `./admin`.
 *
 * The `server-only` import makes bundling this into client JavaScript
 * a build-time error rather than a silent leak.
 *
 * Cookie writes are wrapped in try/catch per the standard Supabase SSR
 * pattern: Server Components can't set cookies (only Server
 * Actions/Route Handlers can) — `middleware.ts` is what actually keeps
 * the session refreshed for the Server Component case.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — no-op; middleware.ts
            // handles session refresh for that case instead.
          }
        },
      },
    }
  );
}
