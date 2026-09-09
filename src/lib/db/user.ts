/**
 * Resolves the signed-in user.
 *
 * Auth is not wired up yet, so this falls back to the seeded demo user from
 * prisma/demo-data.ts. Replace the lookup with the NextAuth session once
 * authentication lands — every caller already treats the result as "the current
 * user", so nothing above this file needs to change.
 */
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPro: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true, name: true, email: true, image: true, isPro: true },
  });
}
