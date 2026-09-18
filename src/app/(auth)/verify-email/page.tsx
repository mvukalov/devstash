import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ResendVerification } from "@/components/auth/resend-verification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { consumeEmailVerificationToken } from "@/lib/db/verification-token";

export const metadata: Metadata = {
  title: "Verify email · DevStash",
};

/**
 * The page the emailed link opens.
 *
 * A server component that spends the token as it renders — the link is the
 * whole interaction, so there is nothing to click here on the happy path. It
 * redirects on success rather than showing a "verified" card, so a refresh does
 * not re-run a token that no longer exists.
 *
 * One consequence of verifying on GET: a mail client that pre-fetches links
 * will spend the token before the person clicks it. They still end up verified,
 * which is why that is acceptable here — but it is the reason a bank would put
 * a button on this page instead.
 */
export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { token } = await searchParams;

  if (typeof token !== "string" || token.length === 0) {
    return (
      <VerifyEmailCard
        title="Invalid link"
        description="That link is missing its token. Paste the whole URL from the email, or ask for a new one."
      >
        <ResendVerification />
      </VerifyEmailCard>
    );
  }

  const outcome = await consumeEmailVerificationToken(token);

  if (outcome.status === "verified" || outcome.status === "already-verified") {
    redirect("/sign-in?verified=1");
  }

  if (outcome.status === "expired") {
    return (
      <VerifyEmailCard
        title="Link expired"
        description="Verification links last 24 hours. Send yourself a fresh one."
      >
        <ResendVerification email={outcome.email} />
      </VerifyEmailCard>
    );
  }

  return (
    <VerifyEmailCard
      title="Invalid link"
      description="That link has already been used or is no longer valid. Ask for a new one below."
    >
      <ResendVerification />
    </VerifyEmailCard>
  );
}

function VerifyEmailCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        {children}

        <Button asChild variant="ghost" className="w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
