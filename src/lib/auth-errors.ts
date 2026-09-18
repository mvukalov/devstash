/**
 * The one credentials failure the user is told apart from the others.
 *
 * `authorize` can only answer yes or no, and every no surfaces as
 * `CredentialsSignin` — so a correct password on an unverified account would
 * otherwise read as "Wrong email or password". Throwing a subclass carries a
 * `code` through to the caller, which is what lets the sign-in action show the
 * verify prompt instead.
 *
 * It is thrown only *after* the password checks out, so it never reveals
 * whether an address has an account to someone who does not already know the
 * password. The code does reach the URL on the non-action path, which is why it
 * says nothing beyond "this address is unverified".
 */
import { CredentialsSignin } from "next-auth";

export const UNVERIFIED_EMAIL_CODE = "unverified_email";

export class UnverifiedEmailError extends CredentialsSignin {
  code = UNVERIFIED_EMAIL_CODE;
}
