/**
 * The "verify your email" message.
 *
 * Plain inline-styled HTML rather than react-email: this is the only template
 * in the app, and a second rendering dependency is not worth one message. The
 * text part is sent explicitly so clients that refuse HTML still get the link.
 */
import "server-only";

import { createEmailVerificationToken } from "@/lib/db/verification-token";
import { appUrl, emailFrom, resendClient } from "@/lib/email/resend";

const SUBJECT = "Verify your DevStash email";

export function verificationUrl(token: string): string {
  return `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

function html(name: string | null, url: string): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#0a0a0a;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#e5e5e5">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto">
      <tr><td style="padding-bottom:24px;font-size:18px;font-weight:600;color:#fafafa">DevStash</td></tr>
      <tr><td style="font-size:14px;line-height:22px">
        <p style="margin:0 0 16px">${greeting}</p>
        <p style="margin:0 0 24px">Confirm this address to finish setting up your DevStash account.</p>
        <p style="margin:0 0 24px">
          <a href="${url}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#fafafa;color:#0a0a0a;font-weight:600;text-decoration:none">Verify email</a>
        </p>
        <p style="margin:0 0 8px;color:#a3a3a3">Or paste this link into your browser:</p>
        <p style="margin:0 0 24px;word-break:break-all"><a href="${url}" style="color:#a3a3a3">${url}</a></p>
        <p style="margin:0;color:#a3a3a3">The link expires in 24 hours. If you did not create a DevStash account, you can ignore this email.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function text(name: string | null, url: string): string {
  return [
    name ? `Hi ${name},` : "Hi,",
    "",
    "Confirm this address to finish setting up your DevStash account:",
    url,
    "",
    "The link expires in 24 hours. If you did not create a DevStash account, you can ignore this email.",
  ].join("\n");
}

/**
 * Sends the verification email.
 *
 * Returns whether it went out rather than throwing: registration has already
 * created the account by this point, and a Resend outage should not undo that
 * or show the user a 500 — the UI points at the resend path instead.
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string | null;
  token: string;
}): Promise<boolean> {
  const url = verificationUrl(token);

  try {
    // The SDK reports API failures in `error` rather than throwing; the catch
    // is for the network itself and for a missing API key.
    const { error } = await resendClient().emails.send({
      from: emailFrom(),
      to,
      subject: SUBJECT,
      html: html(name, url),
      text: text(name, url),
    });

    if (error) {
      console.error("Verification email rejected by Resend", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Verification email failed to send", error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Issues a fresh token and mails the link.
 *
 * The one entry point for both callers — registration and the resend endpoint —
 * so a link can only ever be sent alongside a token that was just created.
 */
export async function sendVerificationLink(user: {
  email: string;
  name: string | null;
}): Promise<boolean> {
  try {
    const token = await createEmailVerificationToken(user.email);
    return await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
    });
  } catch (error) {
    console.error("Could not issue a verification token", error);
    return false;
  }
}
