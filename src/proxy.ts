/**
 * Route protection.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` and the named export to
 * `proxy`; the file still has to sit beside `app/`, so it lives in `src/`.
 *
 * It initialises NextAuth from the edge-safe config only — the session is read
 * from the JWT cookie, with no database round trip.
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  if (req.auth) {
    return;
  }

  // NextAuth's own sign-in page — the spec keeps `pages.signIn` unset, so this
  // is the built-in one at /api/auth/signin.
  const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
  );

  return NextResponse.redirect(signInUrl);
});

// Only the dashboard is gated for now. The matcher keeps everything else —
// including /api/auth/* itself — out of the proxy entirely.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
