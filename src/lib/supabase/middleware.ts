import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protected route prefixes per site.
 * If a user is NOT authenticated and tries to access these,
 * they get redirected to the login page of the corresponding site.
 */
const PROTECTED_PREFIXES: Record<string, string> = {
  "/_saas/dashboard": "/_saas/auth/login",
  "/_network/dashboard": "/_network/auth/login",
  "/dashboard": "/auth/login", // marketplace (patient)
};

/**
 * Auth pages — if user IS authenticated, redirect them to dashboard.
 */
const AUTH_PREFIXES: Record<string, string> = {
  "/_saas/auth": "/_saas/dashboard",
  "/_network/auth": "/_network/dashboard",
  "/auth": "/",
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check protected routes: redirect to login if not authenticated
  for (const [prefix, loginPath] of Object.entries(PROTECTED_PREFIXES)) {
    if (pathname.startsWith(prefix)) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = loginPath;
        // Preserve the original path so we can redirect back after login
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      break;
    }
  }

  // Check auth routes: redirect to dashboard if already authenticated
  // (skip callback routes — they need to complete the OAuth/email flow)
  if (!pathname.includes("/auth/callback")) {
    for (const [prefix, dashboardPath] of Object.entries(AUTH_PREFIXES)) {
      if (pathname.startsWith(prefix)) {
        if (user) {
          const url = request.nextUrl.clone();
          url.pathname = dashboardPath;
          return NextResponse.redirect(url);
        }
        break;
      }
    }
  }

  return supabaseResponse;
}
