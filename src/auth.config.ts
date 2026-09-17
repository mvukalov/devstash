/**
 * Edge-safe half of the NextAuth config.
 *
 * Holds only what can run outside Node — providers and callbacks that touch no
 * database. The Prisma adapter lives in src/auth.ts, which pulls this in. The
 * proxy imports this file rather than src/auth.ts so route protection never
 * loads Prisma. See https://authjs.dev/guides/upgrade-to-v5#edge-compatibility
 */
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// GitHub reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment on its
// own — v5 infers them from the provider name, so nothing is passed here.
export default {
  providers: [GitHub],
} satisfies NextAuthConfig;
