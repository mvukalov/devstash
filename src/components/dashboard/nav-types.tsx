"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { ItemTypeCounts } from "@/lib/db/items";
import {
  TYPE_ICONS,
  TYPE_LABELS,
  TYPE_TEXT_CLASSES,
  itemTypeSlug,
} from "@/lib/item-types";
import {
  SYSTEM_ITEM_TYPE_NAMES,
  isProItemTypeName,
} from "@/lib/system-item-types";

interface NavTypesProps {
  /** Item count per type — the list itself is the fixed set of system types. */
  counts: ItemTypeCounts;
}

/** Item types, each linking to its filtered list at `/items/[type]`. */
export function NavTypes({ counts }: NavTypesProps) {
  const pathname = usePathname();

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="hover:text-sidebar-foreground w-full cursor-pointer">
            Types
            <ChevronDown className="ml-1 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {SYSTEM_ITEM_TYPE_NAMES.map((name) => {
                const Icon = TYPE_ICONS[name];
                const href = `/items/${itemTypeSlug(name)}`;

                return (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton asChild isActive={pathname === href}>
                      <Link href={href}>
                        <Icon className={TYPE_TEXT_CLASSES[name]} />
                        <span>{TYPE_LABELS[name]}</span>
                        {/* Marks a Pro-only type; it gates nothing on its own. */}
                        {isProItemTypeName(name) ? (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground h-4 px-1 text-[10px] tracking-wide uppercase"
                          >
                            Pro
                          </Badge>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-muted-foreground">
                      {counts[name]}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
