/**
 * Resend a verification link.
 *
 * Answers the same way whatever it finds — unknown address, already verified,
 * link sent — so it cannot be used to test whether an address has an account.
 * The work happens only when there is genuinely something to send.
 *
 * A route handler rather than a server action for the same reason registration
 * is one: it is public, it has a rate limit to report through 429, and the
 * sign-in form calls it with fetch.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { isEmailVerificationEnabled } from "@/lib/config";
import { findUserByEmail } from "@/lib/db/auth-user";
import { sendVerificationLink } from "@/lib/email/verification";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Sending email costs money and the address is attacker-controlled, so this is
// tighter than registration's window is generous.
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const GENERIC_MESSAGE =
  "If that address needs verifying, a new link is on its way.";

const bodySchema = z.object({ email: z.email() });

export async function POST(request: Request) {
  const limit = rateLimit(
    `verify-resend:${clientIp(request)}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);

  // A malformed address is a client bug rather than a probe, so it is the one
  // case that gets a real answer.
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address" },
      { status: 422 },
    );
  }

  // Same generic answer while verification is off — nothing needs a link then.
  const user = isEmailVerificationEnabled()
    ? await findUserByEmail(parsed.data.email)
    : null;

  if (user?.email && !user.emailVerified) {
    await sendVerificationLink({ email: user.email, name: user.name });
  }

  return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
}
