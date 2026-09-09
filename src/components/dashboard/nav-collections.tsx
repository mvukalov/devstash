"use client";

import { ChevronDown, Folder, Star } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Collection } from "@/lib/mock-data";

interface NavCollectionsProps {
  favorites: Collection[];
  recent: Collection[];
}

/**
 * Favourite and most recent collections. Rows do not navigate yet — collection
 * pages are a later milestone.
 */
export function NavCollections({ favorites, recent }: NavCollectionsProps) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="hover:text-sidebar-foreground w-full cursor-pointer">
            Collections
            <ChevronDown className="ml-1 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="space-y-3">
            <CollectionList
              label="Favorites"
              collections={favorites}
              showStar
            />
            <CollectionList label="Recent" collections={recent} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

interface CollectionListProps {
  label: string;
  collections: Collection[];
  showStar?: boolean;
}

function CollectionList({ label, collections, showStar }: CollectionListProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-muted-foreground px-2 pb-1 text-[0.7rem] font-medium tracking-wider uppercase">
        {label}
      </p>
      <SidebarMenu>
        {collections.map((collection) => (
          <SidebarMenuItem key={collection.id}>
            <SidebarMenuButton>
              <Folder className="text-muted-foreground" />
              <span>{collection.name}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge
              className={showStar ? undefined : "text-muted-foreground"}
            >
              {showStar ? (
                <Star className="fill-type-note text-type-note size-3.5" />
              ) : (
                collection.itemCount
              )}
            </SidebarMenuBadge>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
