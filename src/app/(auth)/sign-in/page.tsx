import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithGitHub } from "@/actions/auth";
import { GithubIcon } from "@/components/auth/github-icon";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isEmailVerificationEnabled } from "@/lib/config";
import { getCurrentUser } from "@/lib/db/user";

export const metadata: Metadata = {
  title: "Sign in · DevStash",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const user = await getCurrentUser();

  // Nothing here to offer someone who is already signed in.
  if (user) {
    redirect("/dashboard");
  }

  const { callbackUrl, registered, verified } = await searchParams;
  const callback = typeof callbackUrl === "string" ? callbackUrl : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          {verified
            ? "Email verified. Sign in to get started."
            : registered
              ? isEmailVerificationEnabled()
                ? "Account created. Check your email for the verification link."
                : "Account created. Sign in to get started."
              : "Sign in to your DevStash account."}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form action={signInWithGitHub}>
          <input type="hidden" name="callbackUrl" value={callback ?? ""} />
          <Button type="submit" variant="outline" className="w-full">
            <GithubIcon className="size-4" />
            Sign in with GitHub
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <Separator className="flex-1" />
        </div>

        <SignInForm callbackUrl={callback} />

        <p className="text-muted-foreground text-center text-sm">
          No account?{" "}
          <Link href="/register" className="text-foreground underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
