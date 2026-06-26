import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Supported locales — duplicated here (not imported from src/lib/i18n)
 * because proxy.ts runs in an isolated edge/node context where
 * path aliases (@/lib/...) are not available.
 */
const locales = ["ar", "en"];
const defaultLocale = "ar";

/**
 * Stateless locale proxy — Next.js 16 convention.
 *
 * • URLs with a valid locale prefix (/ar/… or /en/…) pass through.
 * • URLs without a prefix are internally rewritten to /{defaultLocale}/…
 *   so Arabic users keep clean, prefix-free URLs in the address bar.
 * • No cookies are read or written — resolution is purely URL-based.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip paths that look like static files (have a file extension)
  if (/\.\w+$/.test(pathname)) {
    return NextResponse.next();
  }

  // If the pathname already starts with a supported locale, pass through
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // No locale prefix detected → rewrite internally to the default locale.
  // This keeps /shop visible in the browser while resolving to /ar/shop.
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(request.nextUrl);
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - api           (API routes)
     * - _next/static  (static chunks / CSS / JS)
     * - _next/image   (image optimisation endpoint)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
