import "server-only";

/**
 * Whether new email/password accounts must verify their address before they
 * can sign in. Set SKIP_EMAIL_VERIFICATION="true" to switch it off — useful
 * while Resend has no verified domain and can only mail the account owner.
 *
 * Only the exact string "true" skips it, so a missing or mistyped variable
 * leaves verification on rather than silently opening sign-in.
 */
export function isEmailVerificationEnabled(): boolean {
  return process.env.SKIP_EMAIL_VERIFICATION !== "true";
}
