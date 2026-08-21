import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Standard Supabase SSR email-confirmation callback (spec §16). If the
 * project has email confirmation enabled, `emailRedirectTo` in
 * `authService.signUp` points here with a `?code=` param; this
 * exchanges it for a session and redirects into the app. Route
 * Handlers (unlike Server Components) can write cookies, so this is
 * the one place in the auth flow that actually needs to be a route
 * rather than a Server Action.
 *
 * Untestable in this environment (no live Supabase project — see
 * MODULE-5B-HANDOFF.md §13); reviewed against Supabase's documented
 * SSR callback pattern rather than exercised end-to-end.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") ?? "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
    console.error("auth/callback: exchangeCodeForSession failed", error);
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
