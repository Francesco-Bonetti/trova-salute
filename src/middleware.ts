import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Multi-domain routing middleware for Trova Salute.
 *
 * Production domains:
 *   trovasalute.com          → /(marketplace)  (B2C patient-facing)
 *   studi.trovasalute.com    → /(saas)         (Studio management SaaS)
 *   pro.trovasalute.com      → /(network)      (Professional network)
 *
 * Development:
 *   localhost:3000            → /(marketplace)
 *   studi.localhost:3000      → /(saas)
 *   pro.localhost:3000        → /(network)
 *
 * Uses NextResponse.rewrite() — NEVER redirect, to preserve SEO and URLs.
 */

const ROUTE_MAP: Record<string, string> = {
  studi: "/(saas)",
  pro: "/(network)",
};

function getRouteGroup(host: string): string {
  // Remove port for local dev (e.g. "studi.localhost:3000" → "studi.localhost")
  const hostname = host.split(":")[0];

  // Extract subdomain: "studi.trovasalute.com" → "studi"
  // Also handles: "studi.localhost" → "studi"
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const subdomain = parts[0];
    if (ROUTE_MAP[subdomain]) {
      return ROUTE_MAP[subdomain];
    }
  }

  // Default: marketplace (main domain or localhost without subdomain)
  return "/(marketplace)";
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "localhost:3000";
  const routeGroup = getRouteGroup(host);

  // Build the rewrite URL
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Skip rewriting for:
  // - Next.js internals (_next/*)
  // - API routes (/api/*)
  // - Static files (favicon, images, etc.)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return updateSession(request);
  }

  // Rewrite to the correct route group
  url.pathname = `${routeGroup}${pathname}`;

  const response = NextResponse.rewrite(url, { request });

  // Refresh Supabase session cookies
  const supabaseResponse = await updateSession(request);

  // Merge Supabase cookies into the rewrite response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
