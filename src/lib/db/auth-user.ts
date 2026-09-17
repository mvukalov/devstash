/**
 * User lookups used by the auth layer itself.
 *
 * Deliberately separate from src/lib/db/user.ts: that one resolves the *signed
 * in* user and so imports src/auth.ts, while src/auth.ts needs the lookup below
 * to verify a password. Keeping them apart is what stops that cycle.
 */
import "server-only";

import { prisma } from "@/lib/prisma";

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
