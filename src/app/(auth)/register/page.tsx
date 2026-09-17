import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/db/user";

export const metadata: Metadata = {
  title: "Create account · DevStash",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Stash snippets, prompts, commands and notes in one place.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <RegisterForm />

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
