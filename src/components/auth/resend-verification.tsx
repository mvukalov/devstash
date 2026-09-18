"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

/**
 * "Send me another link."
 *
 * Takes the address when one is already known — after a sign-in attempt, or
 * from an expired link — and asks for it only when it is not. The endpoint
 * answers the same way whatever it finds, so this shows the same message for
 * every address rather than reporting what happened.
 *
 * The known-address case is a bare button rather than a form on purpose: it
 * renders *inside* the sign-in form, and a nested <form> is invalid HTML.
 */
export function ResendVerification({ email }: { email?: string }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function send(address: string) {
    setPending(true);

    try {
      const response = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });

      const result: { success: boolean; message?: string; error?: string } =
        await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error ?? "Could not send the link");
        setPending(false);
        return;
      }

      toast.success("Check your email", { description: result.message });
      setSent(true);
    } catch {
      toast.error("Could not reach the server. Try again.");
    }

    setPending(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const address = new FormData(event.currentTarget)
      .get("resendEmail")
      ?.toString();

    if (address) {
      void send(address);
    }
  }

  const button = (
    <Button
      type={email ? "button" : "submit"}
      variant="outline"
      className="w-full"
      disabled={pending || sent}
      onClick={email ? () => void send(email) : undefined}
    >
      {sent ? "Link sent" : pending ? "Sending…" : "Resend verification email"}
    </Button>
  );

  if (email) {
    return button;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <AuthField
        label="Email"
        id="resendEmail"
        name="resendEmail"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      {button}
    </form>
  );
}
