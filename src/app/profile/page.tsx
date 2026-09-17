import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser, getSignInMethods } from "@/lib/db/user";

export const metadata: Metadata = {
  title: "Profile · DevStash",
};

/**
 * The account the avatar in the sidebar links to.
 *
 * Read-only for now: the spec asks for the link, not for editing. It exists so
 * that link resolves rather than 404s, the same reason /collections was added
 * in step 12.
 */
export default async function ProfilePage() {
  const user = await getCurrentUser();

  // The proxy only gates /dashboard, so this page guards itself.
  if (!user) {
    redirect("/sign-in?callbackUrl=%2Fprofile");
  }

  const name = user.name ?? user.email ?? "Account";
  const signInMethods = await getSignInMethods(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Your DevStash account.</p>
      </div>

      <Card>
        <CardHeader>
          {/* CardHeader lays its children out on a grid, so the avatar and the
              name go in one flex child rather than being two grid rows. */}
          <div className="flex items-center gap-4">
            <UserAvatar image={user.image} name={name} size="lg" />
            <div className="min-w-0">
              <CardTitle className="truncate">{name}</CardTitle>
              <CardDescription className="truncate">
                {user.email ?? "No email on this account"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="mt-1">
                <Badge variant={user.isPro ? "default" : "outline"}>
                  {user.isPro ? "Pro" : "Free"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {signInMethods.length === 1 ? "Sign-in method" : "Sign-in methods"}
              </dt>
              <dd className="mt-1">
                {signInMethods.length > 0
                  ? signInMethods.join(", ")
                  : "None — this account cannot sign in"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
