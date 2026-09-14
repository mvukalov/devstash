import { Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/db/user";

interface SidebarUserProps {
  user: CurrentUser | null;
}

/** Account row at the bottom of the sidebar. Settings is display only. */
export function SidebarUser({ user }: SidebarUserProps) {
  // Name and email are optional on the model (a GitHub account may supply
  // neither), so fall back to the other before showing a placeholder.
  const name = user?.name ?? user?.email ?? "Signed out";
  const initials =
    name
      .split(/[\s@.]+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <Avatar size="lg">
        {user?.image ? <AvatarImage src={user.image} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Settings">
        <Settings />
      </Button>
    </div>
  );
}
