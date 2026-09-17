import Link from "next/link";
import { ChevronsUpDown, LogOut, User } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/lib/db/user";

interface SidebarUserProps {
  user: CurrentUser | null;
}

/**
 * Account row at the bottom of the sidebar.
 *
 * A server component: the only interactive parts are the dropdown, which is
 * already a client component, and the sign-out form, which posts a server
 * action.
 */
export function SidebarUser({ user }: SidebarUserProps) {
  // Signed out is reachable on any page the proxy does not gate.
  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/sign-in">Sign in</Link>
      </Button>
    );
  }

  // Name and email are both optional on the model (a GitHub account may supply
  // neither), so fall back to the other before showing a placeholder.
  const name = user.name ?? user.email ?? "Account";

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      {/* The spec puts the profile behind the avatar itself, so it is its own
          link rather than a dropdown entry. */}
      <Link
        href="/profile"
        aria-label="Your profile"
        className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
      >
        <UserAvatar image={user.image} name={name} size="lg" />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Account menu">
            <ChevronsUpDown />
          </Button>
        </DropdownMenuTrigger>

        {/* Opens upwards: the trigger sits at the bottom of the sidebar. */}
        <DropdownMenuContent side="top" align="end" className="w-56">
          <DropdownMenuLabel className="truncate font-normal">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="text-muted-foreground block truncate text-xs">
              {user.email}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            {/* A form, not an onClick: signOut runs on the server, so this
                works before hydration and needs no client component. */}
            <form action={signOutAction}>
              <button type="submit" className="flex w-full items-center gap-2">
                <LogOut />
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
