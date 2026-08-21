import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Standard Supabase SSR session-refresh middleware. Server Components
 * can read cookies but can't write them (see `lib/supabase/server.ts`'s
 * `setAll` no-op comment) — this is what actually keeps an
 * authenticated session's tokens fresh across requests.
 *
 * Module 5B adds route protection on top of the session-refresh
 * Module 5A already had: `/account` redirects unauthenticated visitors
 * to `/login`, and `/login`/`/signup` redirect an already-authenticated
 * visitor back to `/account` rather than showing them a sign-in form
 * for a session they already have. Every other route (`/`, `/about`,
 * `/services`, `/start-project`, etc.) stays public — this list is
 * intentionally an allow-list of what's PROTECTED, not the other way
 * around (spec §15 — "do not blindly protect the entire website").
 *
 * Module 7A adds `/admin` to that same allow-list: an anonymous
 * visitor is redirected to `/login` here, same as `/account`. This
 * layer only checks "is there a session at all" — it cannot check the
 * `admin` role without a database round trip, so an authenticated
 * non-admin still passes this check and is caught by the admin route
 * group's own layout (`src/app/admin/layout.tsx`) instead.
 *
 * This is a defense-in-depth layer, not the only check: `/account`'s
 * own Server Component also calls `getCurrentUser()` and redirects if
 * absent (`src/app/(site)/account/page.tsx`), and `/admin`'s layout calls
 * `getCurrentProfile()` and checks `role` — spec §5's "server-side
 * checks must not rely solely on client-side state" applies to relying
 * solely on middleware too.
 *
 * Runs on every request except static assets (see `config.matcher`
 * below) — cheap: one cookie read/write pass, no extra database query
 * beyond the session-refresh call already here.
 */
const PROTECTED_PREFIXES = ["/account", "/admin"];
const AUTH_ROUTES = ["/login", "/signup"];

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_ROUTES.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

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
