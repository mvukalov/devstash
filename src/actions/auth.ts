"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { signInSchema } from "@/lib/validation/auth";

export interface AuthActionState {
  error: string | null;
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
