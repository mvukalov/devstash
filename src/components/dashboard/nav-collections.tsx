"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import type { CollectionSummary } from "@/lib/db/collections";
import { TYPE_DOT_CLASSES, TYPE_LABELS } from "@/lib/item-types";

const ALL_COLLECTIONS_HREF = "/collections";

interface NavCollectionsProps {
  favorites: CollectionSummary[];
  recent: CollectionSummary[];
}

/**
 * Favourite and most recent collections. The rows themselves do not navigate
 * yet — per-collection pages are a later milestone — but "View all
 * collections" links to the full list.
 */
export function NavCollections({ favorites, recent }: NavCollectionsProps) {
  const pathname = usePathname();

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

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === ALL_COLLECTIONS_HREF}
                  className="text-muted-foreground"
                >
                  <Link href={ALL_COLLECTIONS_HREF}>
                    <Folder />
                    <span>View all collections</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

interface CollectionListProps {
  label: string;
  collections: CollectionSummary[];
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
              {showStar ? (
                <Folder className="text-muted-foreground" />
              ) : (
                <DominantTypeDot collection={collection} />
              )}
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

/**
 * Circle tinted by the collection's most-used type. Falls back to a muted ring
 * for an empty collection, which has no dominant type.
 */
function DominantTypeDot({ collection }: { collection: CollectionSummary }) {
  const [dominantType] = collection.typeNames;

  return (
    // The size-4 box matches an icon's footprint, so the labels in the Recent
    // and Favorites lists line up with each other.
    <span
      role="img"
      aria-label={dominantType ? TYPE_LABELS[dominantType] : "No items"}
      className="flex size-4 shrink-0 items-center justify-center"
    >
      <span
        className={`size-2.5 rounded-full ${
          dominantType
            ? TYPE_DOT_CLASSES[dominantType]
            : "border-muted-foreground border"
        }`}
      />
    </span>
  );
}
