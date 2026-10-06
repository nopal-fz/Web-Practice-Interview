import { NextResponse, type NextRequest } from "next/server";

// Nonce-based CSP. middleware.ts is deprecated in this Next version; the
// convention is now proxy.ts (next/dist/docs/.../file-conventions/proxy.md).
//
// Why a nonce and not a static header: the static alternative has to allow
// 'unsafe-inline' for scripts, which defeats the point, since any injected
// <script> would still run. A nonce lets Next attach it to its own framework
// tags during SSR while blocking everything else. Cost: pages must render
// dynamically. Every route here is already dynamic (SQLite, per-request data),
// so nothing is lost.
//
// x-nonce goes on the REQUEST headers because that is what Next reads to
// extract the nonce during render; the response header is what the browser
// enforces. Both carry the same value.
//
// ponytail: /_not-found is prerendered at build, so it has no nonce and
// strict-dynamic blocks its scripts, leaving that one page unhydrated. It only
// has a heading and an <a href>, so nothing breaks. If not-found.tsx ever grows
// a client component, add `await connection()` to it so it renders per request.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    // strict-dynamic lets the nonced Next bootstrap load its own chunks without
    // this policy having to enumerate hashed bundle filenames.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // No 'unsafe-inline': every inline style in this app is a class now, and
    // a nonce never applies to style="" attributes regardless.
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    // No third-party origins on purpose: no analytics, no CDN, fonts are
    // self-hosted by next/font.
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Dev serves over http://localhost, where upgrading subresources to https
    // would break them.
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Static assets do not need a CSP, and prefetches would burn a nonce
      // each. Excluding them also keeps the matcher from blocking CSS/JS.
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};