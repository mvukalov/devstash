import { Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/mock-data";

interface SidebarUserProps {
  user: User;
}

/** Account row at the bottom of the sidebar. Settings is display only. */
export function SidebarUser({ user }: SidebarUserProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <Avatar size="lg">
        {user.image ? <AvatarImage src={user.image} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Settings">
        <Settings />
      </Button>
    </div>
  );
}
