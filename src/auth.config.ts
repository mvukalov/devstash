/**
 * Edge-safe half of the NextAuth config.
 *
 * Holds only what can run outside Node — providers and callbacks that touch no
 * database. The Prisma adapter lives in src/auth.ts, which pulls this in. The
 * proxy imports this file rather than src/auth.ts so route protection never
 * loads Prisma. See https://authjs.dev/guides/upgrade-to-v5#edge-compatibility
 */
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

import { CREDENTIALS_FIELDS } from "@/lib/validation/auth";

// GitHub reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment on its
// own — v5 infers them from the provider name, so nothing is passed here.
export default {
  // Phase 1 deliberately left this unset so NextAuth's own page was used. The
  // custom page at /sign-in replaces it, and src/proxy.ts redirects there.
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    // Placeholder only: it declares the fields so NextAuth renders the form and
    // knows the provider exists in the edge runtime, but it can never sign
    // anyone in. bcrypt and Prisma are Node-only, so the real `authorize` is
    // swapped in by src/auth.ts — the half that actually handles requests.
    Credentials({
      credentials: CREDENTIALS_FIELDS,
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
