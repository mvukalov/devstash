/**
 * Email verification tokens.
 *
 * Stored in the `VerificationToken` model that came with the NextAuth adapter
 * shape and had never been used — the adapter only touches it for the email
 * (magic link) provider, which this app does not have, so there is nothing to
 * collide with.
 *
 * The raw token goes in the emailed link; only its SHA-256 hash is stored, so a
 * database read cannot be replayed to verify somebody else's address. SHA-256
 * rather than bcrypt because the token is 32 random bytes — there is nothing to
 * brute force, and the lookup has to be a single indexed query.
 */
import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { normalizeEmail } from "@/lib/db/auth-user";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a token for an address and returns the raw value for the link.
 *
 * Any outstanding token for the same address is dropped first: asking for a new
 * link should invalidate the old one, and `@@unique([identifier, token])` makes
 * leaving them around pointless anyway.
 */
export async function createEmailVerificationToken(
  email: string,
): Promise<string> {
  const identifier = normalizeEmail(email);
  const token = randomBytes(32).toString("hex");

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(token),
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}

export type VerificationOutcome =
  | { status: "verified"; email: string }
  | { status: "already-verified"; email: string }
  | { status: "expired"; email: string }
  | { status: "invalid" };

/**
 * Spends a token: marks the address verified and deletes the token.
 *
 * Single use — the row is removed whether or not it had expired, so a link can
 * never be replayed. An expired one still reports the address it was for, which
 * is what lets the page offer to send a fresh link.
 */
export async function consumeEmailVerificationToken(
  token: string,
): Promise<VerificationOutcome> {
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(token) },
  });

  if (!record) {
    return { status: "invalid" };
  }

  await prisma.verificationToken.delete({ where: { token: record.token } });

  if (record.expires.getTime() < Date.now()) {
    return { status: "expired", email: record.identifier };
  }

  // Matched case-insensitively for the same reason findUserByEmail is: an OAuth
  // account can be stored in mixed case.
  const user = await prisma.user.findFirst({
    where: { email: { equals: record.identifier, mode: "insensitive" } },
    select: { id: true, email: true, emailVerified: true },
  });

  // The account was deleted between the email being sent and the link being
  // clicked. Nothing to verify.
  if (!user) {
    return { status: "invalid" };
  }

  if (user.emailVerified) {
    return { status: "already-verified", email: record.identifier };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  return { status: "verified", email: record.identifier };
}
