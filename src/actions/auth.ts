"use server";

import { AuthError, CredentialsSignin } from "next-auth";

import { signIn, signOut } from "@/auth";
import { UNVERIFIED_EMAIL_CODE } from "@/lib/auth-errors";
import { signInSchema } from "@/lib/validation/auth";

export interface AuthActionState {
  error: string | null;
  /** Set when the password was right but the address is still unverified. */
  unverifiedEmail?: string;
}

/**
 * Where to land after signing in.
 *
 * Only a same-origin path is accepted: `callbackUrl` arrives in the query
 * string, so anything else would let a crafted link bounce someone to another
 * site carrying the freshly set session. `//evil.com` is rejected too, since a
 * protocol-relative URL also leaves the origin.
 */
function safeRedirect(callbackUrl: string | undefined): string {
  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
  ) {
    return callbackUrl;
  }

  return "/dashboard";
}

export async function signInWithCredentials(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // The server never trusts the client-side check; this is the one that counts.
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeRedirect(formData.get("callbackUrl")?.toString()),
    });
  } catch (error) {
    // A successful sign-in *also* lands here: signIn redirects by throwing, and
    // that error has to reach Next rather than be swallowed as a failure.
    if (error instanceof AuthError) {
      // Thrown by `authorize` once the password has checked out, so this is the
      // one case where naming the reason is safe.
      if (
        error instanceof CredentialsSignin &&
        error.code === UNVERIFIED_EMAIL_CODE
      ) {
        return {
          error: "Verify your email before signing in.",
          unverifiedEmail: parsed.data.email,
        };
      }

      return {
        error:
          error.type === "CredentialsSignin"
            ? "Wrong email or password"
            : "Could not sign you in. Try again.",
      };
    }

    throw error;
  }

  // Unreachable: signIn either threw a redirect or an AuthError.
  return { error: null };
}

export async function signInWithGitHub(formData: FormData) {
  await signIn("github", {
    redirectTo: safeRedirect(formData.get("callbackUrl")?.toString()),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
