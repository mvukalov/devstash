# Email Verification on Register

## Overview

A new account created through `/register` is not usable until the person clicks
a link sent to their email address. Verification is delivered with Resend
(`RESEND_API_KEY` is already in `.env`).

GitHub OAuth accounts are exempt — GitHub verifies the address itself, so those
users are marked verified and never see this flow.

## Requirements

- Send a verification email on successful registration
- The email carries a single-use link to `/verify-email?token=...`
- Clicking the link sets `User.emailVerified` and sends the user to `/sign-in`
- Credentials sign-in is **blocked** while `emailVerified` is null
- The sign-in page offers a "resend verification email" path for that case
- Tokens expire after 24 hours and are consumed on first use
- No schema change: `User.emailVerified` and `VerificationToken` already exist
  (both came with the NextAuth Prisma adapter shape in the initial migration)

## Flow

```
register  ->  201 + "Check your email"      (user row created, emailVerified = null)
          ->  Resend sends link with token
click     ->  /verify-email?token=...       (server component)
              valid   -> emailVerified = now(), token deleted -> /sign-in?verified=1
              expired -> "Link expired" + resend form
              unknown -> "Invalid link"
sign in   ->  emailVerified null -> refused, "Verify your email" + resend button
```

## Pieces

### Email

- `resend` npm package; a client singleton in `src/lib/email/resend.ts`
- `src/lib/email/verification.ts` — `sendVerificationEmail(to, url)`
- From address in `EMAIL_FROM`; dev uses `onboarding@resend.dev`
- Absolute link built from `APP_URL` (falls back to `http://localhost:3000`)

### Tokens

- `src/lib/db/verification-token.ts` — create / consume, over the existing
  `VerificationToken` model (`identifier` = the normalized email)
- 32 random bytes, hex; **stored as a SHA-256 hash** so a database read cannot
  verify somebody else's address
- Creating a new token for an email deletes that email's outstanding ones

### Routes

- `GET /verify-email` — server component, consumes the token, shows the outcome
- `POST /api/auth/verify-email/resend` — rate-limited (reuse
  `src/lib/rate-limit.ts`), always 200 with a generic message so it cannot be
  used to test whether an address has an account

### Sign-in

- `authorize` in `src/auth.ts` returns null when `emailVerified` is null
- Credentials failures all collapse into `CredentialsSignin`, so the sign-in
  server action checks afterwards whether that email belongs to an unverified
  account and shows the resend prompt instead of "Wrong email or password"
- GitHub: set `emailVerified` on link/sign-in so OAuth users are never blocked

### Register

- `/api/auth/register` sends the email after creating the user
- A send failure does not roll back the account — it returns 201 with a flag and
  the UI points at the resend path

## Env

```
RESEND_API_KEY=""              # already set in .env
EMAIL_FROM="onboarding@resend.dev"
APP_URL="http://localhost:3000"
```

Both new keys documented in `.env.example`.

## Testing

1. Register a new account → 201, "check your email" state
2. Attempt sign-in before clicking → refused with the verify prompt
3. Click the link → `/sign-in?verified=1`, then sign-in succeeds
4. Reuse the same link → "Invalid link" (single use)
5. Expired token (backdate `expires`) → "Link expired" + resend
6. Resend endpoint for an unknown email → 200, no email sent
7. GitHub OAuth sign-in → straight to `/dashboard`, `emailVerified` set
8. `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm run db:test`

## Notes

- Resend's shared `onboarding@resend.dev` sender only delivers to the address on
  the Resend account (martinvukalovic@gmail.com), so end-to-end delivery can
  only be tested with that address until a domain is verified.
- Existing dev accounts (`demo@devstash.io`, `test@test.com`, `brad@test.com`,
  `ada@test.com`, `grace@test.com`) have `emailVerified = null` and would be
  locked out — they need backfilling, or the seed needs to set it.

## References

- Resend Node SDK: https://resend.com/docs/send-with-nextjs
- Auth.js verification tokens: https://authjs.dev/getting-started/database#verificationtoken
