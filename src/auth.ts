/**
 * Full NextAuth config: the edge-safe half plus the Prisma adapter.
 *
 * Import this from server components, route handlers and server actions. The
 * proxy must not — it would drag Prisma in with it (see src/auth.config.ts).
 */
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // Required with the split config: a database session strategy would need the
  // adapter in the proxy, which is the thing the split exists to avoid.
  session: { strategy: "jwt" },
  callbacks: {
    // NextAuth puts the user id in the token's standard `sub` claim on the
    // sign-in pass, so there is no `jwt` callback here — this only copies it
    // onto the session, where the db helpers expect `user.id`.
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
