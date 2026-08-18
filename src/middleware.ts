import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Standard Supabase SSR session-refresh middleware. Server Components
 * can read cookies but can't write them (see `lib/supabase/server.ts`'s
 * `setAll` no-op comment) — this is what actually keeps an
 * authenticated session's tokens fresh across requests. No route in
 * this app is gated on auth yet (no `/login` exists, nothing calls
 * `requireUser`/`requireAdmin` from a page), so this middleware
 * currently does session refresh only, not route protection — that's
 * the future auth-UI module's job, built on top of this.
 *
 * Runs on every request except static assets (see `config.matcher`
 * below) — cheap: one cookie read/write pass, no database query.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refreshes the session token if expired — required for Server
  // Components to see a valid session on the next request.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets, images, and Next internals — matches the
     * standard Supabase SSR middleware matcher recommendation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
