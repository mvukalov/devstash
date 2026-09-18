"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthError } from "@/components/auth/auth-error";
import { AuthField } from "@/components/auth/auth-field";
import { ResendVerification } from "@/components/auth/resend-verification";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validation/auth";

/**
 * Posts to /api/auth/register rather than a server action, because that route
 * already exists and carries the status codes this form reports on (409 for a
 * taken email, 429 for the rate limit). The same Zod schema runs here first, so
 * an obvious mistake never costs a round trip — the server re-validates anyway.
 *
 * Success does not navigate: the account is unusable until the emailed link is
 * clicked, so the form is replaced in place by what to do next rather than
 * dropping the user on a sign-in page that would only refuse them.
 */
export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState<{
    email: string;
    emailSent: boolean;
  } | null>(null);

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

      const result: {
        success: boolean;
        error?: string;
        data?: { emailSent: boolean };
      } = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Could not create the account");
        setPending(false);
        return;
      }

      const emailSent = result.data?.emailSent ?? false;

      if (emailSent) {
        toast.success("Account created", {
          description: "Check your email for the verification link.",
        });
      }

      setRegistered({ email: parsed.data.email, emailSent });
    } catch {
      setError("Could not reach the server. Try again.");
      setPending(false);
    }
  }

  if (registered) {
    return (
      <div className="grid gap-4">
        <div className="bg-muted/40 grid gap-2 rounded-md border px-4 py-5 text-center">
          <MailCheck className="text-muted-foreground mx-auto size-6" />
          <p className="font-medium">Check your email</p>
          <p className="text-muted-foreground text-sm">
            {registered.emailSent ? (
              <>
                We sent a verification link to{" "}
                <span className="text-foreground">{registered.email}</span>.
                Click it to finish setting up your account.
              </>
            ) : (
              <>
                Your account was created, but the verification email could not
                be sent. Try again below.
              </>
            )}
          </p>
        </div>

        <ResendVerification email={registered.email} />

        <Button asChild variant="ghost">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    );
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
