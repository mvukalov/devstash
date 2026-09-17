"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthError } from "@/components/auth/auth-error";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validation/auth";

/**
 * Posts to /api/auth/register rather than a server action, because that route
 * already exists and carries the status codes this form reports on (409 for a
 * taken email, 429 for the rate limit). The same Zod schema runs here first, so
 * an obvious mistake never costs a round trip — the server re-validates anyway.
 */
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const values = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    };

    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result: { success: boolean; error?: string } =
        await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Could not create the account");
        setPending(false);
        return;
      }

      // Registration does not sign anyone in — the spec sends them to sign in
      // with the account they just made.
      router.push("/sign-in?registered=1");
    } catch {
      setError("Could not reach the server. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <AuthField
        label="Name"
        id="name"
        name="name"
        autoComplete="name"
        placeholder="Ada Lovelace"
        required
      />
      <AuthField
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <AuthField
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      <AuthField
        label="Confirm password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
      />

      <AuthError message={error} />

      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
