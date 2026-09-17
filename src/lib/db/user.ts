/**
 * Resolves the signed-in user.
 *
 * Every src/lib/db query is scoped by user id, and this is where that id comes
 * from. It reads the NextAuth session rather than trusting it wholesale: the
 * JWT carries a user id, but the name, email, image and plan are re-read from
 * the database, so a rename or an upgrade shows up without waiting for the
 * token to be reissued. A session pointing at a deleted user resolves to null.
 */
import "server-only";

import { cache } from "react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPro: boolean;
}

/**
 * Cached per request: the sidebar and the page both resolve the user, and
 * should share one lookup.
 */
export const getCurrentUser = cache(
  async function getCurrentUser(): Promise<CurrentUser | null> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, isPro: true },
    });
  },
);

/**
 * How this account can sign in.
 *
 * Read from what actually grants access — a bcrypt hash on the user, and the
 * `Account` rows the adapter writes per OAuth provider — rather than inferred
 * from something correlated like having a picture. An account can have both.
 */
export async function getSignInMethods(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      hashedPassword: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    return [];
  }

  const methods = user.accounts.map(({ provider }) =>
    provider === "github" ? "GitHub" : provider,
  );

  if (user.hashedPassword) {
    methods.push("Email and password");
  }

  return methods;
}
