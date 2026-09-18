/**
 * Email/password registration.
 *
 * A route handler rather than a server action: it is a public endpoint that has
 * to return real HTTP status codes (409 on a taken email, 422 on a bad body),
 * and the CLI/mobile clients in the project overview will call it directly.
 *
 * Sign-in itself stays with NextAuth — this only creates the row that
 * src/auth.ts's Credentials `authorize` later reads. That row starts
 * unverified, and `authorize` refuses it until the emailed link is clicked.
 */
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { findUserByEmail, normalizeEmail } from "@/lib/db/auth-user";
import { sendVerificationLink } from "@/lib/email/verification";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation/auth";

// Matches the seed, so demo and registered accounts hash identically.
const BCRYPT_ROUNDS = 12;

// Each attempt costs ~290ms of CPU in bcrypt, so the ceiling is low. Generous
// for a human filling in a form once, cheap to enforce.
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type RegisterResponse =
  | {
      success: true;
      data: {
        id: string;
        name: string | null;
        email: string | null;
        /** False when the account exists but the link could not be mailed. */
        emailSent: boolean;
      };
    }
  | { success: false; error: string };

function failure(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json<RegisterResponse>(
    { success: false, error },
    { status, headers },
  );
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `register:${clientIp(request)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );

  // Checked before the body is read, so a flood costs nothing but a map lookup.
  if (!limit.allowed) {
    return failure("Too many attempts. Try again later.", 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return failure("Request body must be valid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    // The first message is the one worth showing in a toast; the rest repeat
    // the same field or are lower-value.
    return failure(parsed.error.issues[0].message, 422);
  }

  const { name, password } = parsed.data;
  const email = normalizeEmail(parsed.data.email);

  // Case-insensitive, so an OAuth account stored as Foo@Bar.com is found rather
  // than duplicated. See findUserByEmail.
  if (await findUserByEmail(email)) {
    return failure("An account with that email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { id: true, name: true, email: true },
    });

    // A send failure does not undo the account — it exists and is simply
    // unverified, which the resend endpoint can fix. Reporting it lets the form
    // say so instead of claiming an email is on its way.
    const emailSent = await sendVerificationLink({
      email,
      name: user.name,
    });

    return NextResponse.json<RegisterResponse>(
      { success: true, data: { ...user, emailSent } },
      { status: 201 },
    );
  } catch (error) {
    // Two requests for the same email can both pass the check above; the unique
    // index is what actually settles it. It only catches an exact match, which
    // is enough here because every email written by this route is normalized.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("An account with that email already exists", 409);
    }

    console.error("Registration failed", error);
    return failure("Could not create the account", 500);
  }
}
