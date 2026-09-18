/**
 * Resend client.
 *
 * Built lazily rather than at module scope: `prisma generate` and `next build`
 * both import this file's consumers without any secrets in the environment, and
 * constructing the client eagerly would make a missing key fail the build
 * rather than the one request that actually needs to send something.
 */
import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

export function resendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    client = new Resend(apiKey);
  }

  return client;
}

/**
 * Sender address.
 *
 * The default is Resend's shared test sender, which needs no domain setup but
 * only delivers to the address that owns the Resend account. Production sets
 * EMAIL_FROM to an address on a verified domain.
 */
export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";
}

/** Origin for links inside emails — never a relative path, they open elsewhere. */
export function appUrl(): string {
  const url =
    process.env.APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

  return url.replace(/\/$/, "");
}
