import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role Supabase client — bypasses RLS entirely. This is the
 * single most dangerous export in the codebase; treat it accordingly.
 *
 * Rules, no exceptions:
 * 1. Only ever imported from server-only modules (`import "server-only"`
 *    above enforces this at build time — importing this file from
 *    anything reachable by a client component fails the build).
 * 2. Never imported by `src/lib/repositories/*` for ordinary
 *    read/write operations — those use `createSupabaseServerClient()`
 *    (`./server.ts`) so RLS still applies, even on the server.
 * 3. Reserved for genuinely privileged operations where RLS can't
 *    express the rule (auth admin API calls, cross-user admin
 *    reads once the admin module lands, storage bucket
 *    provisioning). Nothing in Module 5 currently calls this client —
 *    it's foundation for the admin module (Module 6+), not in use yet.
 *
 * `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix, so Next.js
 * itself refuses to inline it into client bundles — `server-only`
 * above is the second, defense-in-depth guard against a future
 * mistake.
 */
function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createSupabaseAdminClient: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set."
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

let cached: ReturnType<typeof createSupabaseAdminClient> | null = null;

/** Lazily-created singleton — avoids constructing the admin client (and requiring its env vars) on every import in environments that never call it. */
export function getSupabaseAdminClient() {
  if (!cached) cached = createSupabaseAdminClient();
  return cached;
}
