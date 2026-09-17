"use client";

import { useActionState, useState } from "react";

import { signInWithCredentials, type AuthActionState } from "@/actions/auth";
import { AuthError } from "@/components/auth/auth-error";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

const INITIAL_STATE: AuthActionState = { error: null };

/**
 * Client only for the error state and the pending flag — the credentials check
 * itself is the server action, which is also what validates.
 */
export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithCredentials,
    INITIAL_STATE,
  );

  // React resets an uncontrolled form once its action resolves, which would
  // wipe the email on every failed attempt and make the user retype it. The
  // password is deliberately left to clear.
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      <AuthField
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <AuthField
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <AuthError message={state.error} />

      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
