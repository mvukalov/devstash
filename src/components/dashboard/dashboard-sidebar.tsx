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
import { collections, currentUser, itemTypes } from "@/lib/mock-data";

const RECENT_COLLECTION_LIMIT = 5;

/**
 * Dashboard sidebar — item types, collections and the account row.
 * Data comes from the mock file until the database lands.
 */
export function DashboardSidebar() {
  const favorites = collections.filter((collection) => collection.isFavorite);
  const recent = collections
    .filter((collection) => !collection.isFavorite)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_COLLECTION_LIMIT);

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
        <NavTypes types={itemTypes} />
        <SidebarSeparator />
        <NavCollections favorites={favorites} recent={recent} />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarUser user={currentUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
