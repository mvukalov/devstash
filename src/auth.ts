/**
 * Full NextAuth config: the edge-safe half plus the Prisma adapter.
 *
 * Import this from server components, route handlers and server actions. The
 * proxy must not — it would drag Prisma in with it (see src/auth.config.ts).
 */
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";

import authConfig from "@/auth.config";
import { findUserByEmail } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";
import { CREDENTIALS_FIELDS, signInSchema } from "@/lib/validation/auth";

/**
 * A real bcrypt hash of a random string, compared against when no user matches.
 *
 * Without it an unknown email returns immediately while a known one spends
 * ~275ms in bcrypt, which is a timing oracle for whether an address has an
 * account. Hardcoded rather than hashed at startup, which would cost that same
 * ~290ms on every cold boot.
 */
const DUMMY_HASH =
  "$2b$12$8WHvfmckffJCAGjmyP9IY.P3iElmgS9Tu/fmHJvu07SXG124ULWLq";

// The real email/password provider. It replaces the placeholder from
// auth.config.ts, which cannot hold this: bcrypt and Prisma do not run on the
// edge, and the proxy imports that file.
const credentialsProvider = Credentials({
  credentials: CREDENTIALS_FIELDS,
  async authorize(credentials) {
    const parsed = signInSchema.safeParse(credentials);

    if (!parsed.success) {
      return null;
    }

    const user = await findUserByEmail(parsed.data.email);

    // No such user, or one that only ever signed in through GitHub and so has
    // no password to compare against. Both still run a compare, so the miss
    // path costs what a hit does.
    if (!user?.hashedPassword) {
      await bcrypt.compare(parsed.data.password, DUMMY_HASH);
      return null;
    }

    const valid = await bcrypt.compare(
      parsed.data.password,
      user.hashedPassword,
    );

    if (!valid) {
      return null;
    }

    // Never let the hash reach the JWT.
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
});

// GitHub is a plain function reference here, so only the Credentials entry is
// an object carrying `type` — that is what identifies the placeholder.
const providers: Provider[] = authConfig.providers.map((provider) =>
  typeof provider === "object" && provider.type === "credentials"
    ? credentialsProvider
    : provider,
);

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  adapter: PrismaAdapter(prisma),
  // Required with the split config: a database session strategy would need the
  // adapter in the proxy, which is the thing the split exists to avoid. It is
  // also required by the Credentials provider, which the adapter never
  // persists a session for.
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
