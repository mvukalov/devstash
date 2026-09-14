import Link from "next/link";
import { Layers } from "lucide-react";

import { NavCollections } from "@/components/dashboard/nav-collections";
import { NavTypes } from "@/components/dashboard/nav-types";
import { SidebarUser } from "@/components/dashboard/sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { getSidebarCollections } from "@/lib/db/collections";
import { emptyItemTypeCounts, getItemTypeCounts } from "@/lib/db/items";
import { getCurrentUser } from "@/lib/db/user";

const RECENT_COLLECTION_LIMIT = 5;

/** Dashboard sidebar — item types, collections and the account row. */
export async function DashboardSidebar() {
  const user = await getCurrentUser();

  // Signed out is not reachable yet (getCurrentUser resolves the seeded demo
  // user), but the sidebar still renders its empty shape rather than throwing.
  const [{ favorites, recent }, typeCounts] = user
    ? await Promise.all([
        getSidebarCollections(user.id, RECENT_COLLECTION_LIMIT),
        getItemTypeCounts(user.id),
      ])
    : [{ favorites: [], recent: [] }, emptyItemTypeCounts()];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-16 justify-center">
        <Link href="/dashboard" className="flex items-center gap-2 px-1">
          <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </span>
          <span className="text-base font-semibold">DevStash</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavTypes counts={typeCounts} />
        <SidebarSeparator />
        <NavCollections favorites={favorites} recent={recent} />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
