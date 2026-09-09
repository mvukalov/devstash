"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

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
import { TYPE_ICONS, TYPE_TEXT_CLASSES, itemTypeSlug } from "@/lib/item-types";
import type { ItemType } from "@/lib/mock-data";

interface NavTypesProps {
  types: ItemType[];
}

/** Item types, each linking to its filtered list at `/items/[type]`. */
export function NavTypes({ types }: NavTypesProps) {
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
              {types.map((type) => {
                const Icon = TYPE_ICONS[type.name];
                const href = `/items/${itemTypeSlug(type.name)}`;

                return (
                  <SidebarMenuItem key={type.id}>
                    <SidebarMenuButton asChild isActive={pathname === href}>
                      <Link href={href}>
                        <Icon className={TYPE_TEXT_CLASSES[type.name]} />
                        <span>{type.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-muted-foreground">
                      {type.itemCount}
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
