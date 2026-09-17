/**
 * Resolves the signed-in user.
 *
 * Auth is not wired up yet, so this falls back to the seeded demo user from
 * prisma/demo-data.ts. Replace the lookup with the NextAuth session once
 * authentication lands — every caller already treats the result as "the current
 * user", so nothing above this file needs to change.
 */
import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

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
    return prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
      select: { id: true, name: true, email: true, image: true, isPro: true },
    });
  },
);

/**
 * The email as it is stored for credentials accounts.
 *
 * Registration writes this form, so every password-backed account is canonical.
 * OAuth accounts are written by the Prisma adapter with whatever the provider
 * returns, which is why the lookup below cannot simply match on it.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface UserCredentials {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  hashedPassword: string | null;
}

/**
 * Finds a user by email, ignoring case.
 *
 * `User.email` is a plain Postgres unique column, so `Foo@Bar.com` and
 * `foo@bar.com` are two distinct values to the database. Matching case
 * sensitively would let an OAuth account stored in mixed case be missed here —
 * silently creating a second account for the same person on registration, and
 * failing to find it on sign-in. Making the column `citext` would fix it at the
 * database level; until then both callers go through this.
 */
export async function findUserByEmail(
  email: string,
): Promise<UserCredentials | null> {
  return prisma.user.findFirst({
    where: { email: { equals: normalizeEmail(email), mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hashedPassword: true,
    },
  });
}
