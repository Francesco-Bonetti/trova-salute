import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Multi-domain routing middleware for Trova Salute.
 *
 * Production domains:
 *   trovasalute.com          → /(marketplace)       → internal path: /[pathname]
 *   studi.trovasalute.com    → /(saas)/_saas        → internal path: /_saas/[pathname]
 *   pro.trovasalute.com      → /(network)/_network  → internal path: /_network/[pathname]
 *
 * Development:
 *   localhost:3000            → /(marketplace)
 *   studi.localhost:3000      → /(saas)/_saas
 *   pro.localhost:3000        → /(network)/_network
 *
 * Uses NextResponse.rewrite() — NEVER redirect, to preserve SEO and URLs.
 *
 * Why internal prefixes (_saas, _network)?
 * Next.js App Router does not allow multiple route groups to share the same
 * URL path (e.g. two page.tsx both resolving to "/"). By using distinct internal
 * path prefixes, each site gets its own URL namespace while the rewrite keeps
 * the public URL unchanged.
 */

/** Maps subdomain → internal path prefix for rewriting */
const SUBDOMAIN_PREFIX_MAP: Record<string, string> = {
  studi: "/_saas",
  pro: "/_network",
};

function getInternalPrefix(host: string): string | null {
  // Remove port for local dev (e.g. "studi.localhost:3000" → "studi.localhost")
  const hostname = host.split(":")[0];

  // Extract subdomain: "studi.trovasalute.com" → "studi"
  // Also handles: "studi.localhost" → "studi"
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const subdomain = parts[0];
    if (SUBDOMAIN_PREFIX_MAP[subdomain]) {
      return SUBDOMAIN_PREFIX_MAP[subdomain];
    }
  }

  // Default: marketplace uses root path (no prefix needed)
  return null;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "localhost:3000";
  const internalPrefix = getInternalPrefix(host);

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

  // Rewrite to the correct internal path if needed (non-marketplace sites)
  if (internalPrefix) {
    url.pathname = `${internalPrefix}${pathname}`;
    const response = NextResponse.rewrite(url, { request });

    // Refresh Supabase session cookies and merge into response
    const supabaseResponse = await updateSession(request);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, { ...cookie });
    });

    return response;
  }

  // Marketplace: no rewrite needed, just refresh session
  return updateSession(request);
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
