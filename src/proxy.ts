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

  // The custom page, which must match `pages.signIn` in src/auth.config.ts.
  const signInUrl = new URL("/sign-in", req.nextUrl.origin);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
  );

  return NextResponse.redirect(signInUrl);
});

// Every signed-in area. /sign-in, /register and /api/auth/* are deliberately
// absent — the first two are where this redirects to, and the third is what
// performs the sign-in.
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/collections",
    "/collections/:path*",
    "/items",
    "/items/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
