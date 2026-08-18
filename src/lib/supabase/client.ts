"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Browser Supabase client — anon key only, safe to bundle into client
 * JavaScript. Use this ONLY from client components that genuinely need
 * browser-side Supabase access (e.g. a future realtime subscription or
 * client-driven auth UI). Every current form submission in this app
 * (`/start-project`) goes through a Server Action instead (see
 * `src/lib/services/*`) — prefer that path unless the operation
 * specifically has to run in the browser.
 *
 * Do NOT import `./admin` from any file reachable by a client
 * component — that client holds the service-role key and must stay
 * server-only. See `./admin.ts`'s own guard for what happens if you try.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
