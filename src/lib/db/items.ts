/**
 * Item queries for the dashboard.
 *
 * Server-only: these run in server components via the Prisma singleton.
 */
import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  SYSTEM_ITEM_TYPE_NAMES,
  isSystemItemTypeName,
  type SystemItemTypeName,
} from "@/lib/system-item-types";

export interface ItemSummary {
  id: string;
  title: string;
  description: string | null;
  /** null for a custom type, which has no colour/icon mapping yet. */
  typeName: SystemItemTypeName | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
}

export interface ItemStats {
  itemCount: number;
  favoriteItemCount: number;
}

/** How many of the user's items use each system type. Every type is present. */
export type ItemTypeCounts = Record<SystemItemTypeName, number>;

const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  updatedAt: true,
  itemType: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type ItemRecord = Prisma.ItemGetPayload<{ select: typeof ITEM_SELECT }>;

function toSummary({ itemType, tags, ...item }: ItemRecord): ItemSummary {
  return {
    ...item,
    typeName: isSystemItemTypeName(itemType.name) ? itemType.name : null,
    tags: tags.map(({ tag }) => tag.name),
  };
}

/** Every pinned item, most recently updated first. */
export async function getPinnedItems(userId: string): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    select: ITEM_SELECT,
  });

  return items.map(toSummary);
}

/** The user's most recently updated items. */
export async function getRecentItems(
  userId: string,
  limit: number,
): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: ITEM_SELECT,
  });

  return items.map(toSummary);
}

/** A zero count for every system type — the starting tally and the signed-out fallback. */
export function emptyItemTypeCounts(): ItemTypeCounts {
  return Object.fromEntries(
    SYSTEM_ITEM_TYPE_NAMES.map((name) => [name, 0]),
  ) as ItemTypeCounts;
}

/**
 * Item count per system type, for the sidebar badges.
 *
 * One grouped query rather than seven counts. Types the user has no items of
 * are missing from the result, so the tally starts at zero for every type and
 * the sidebar can render the full list; custom types are skipped, since they
 * have no colour/icon mapping yet.
 *
 * Wrapped in `cache()` because the sidebar and `/items/[type]` both ask for it
 * in the same request.
 */
export const getItemTypeCounts = cache(async function getItemTypeCounts(
  userId: string,
): Promise<ItemTypeCounts> {
  const [groups, types] = await Promise.all([
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.itemType.findMany({
      where: { userId: null },
      select: { id: true, name: true },
    }),
  ]);

  const namesById = new Map(types.map(({ id, name }) => [id, name]));
  const counts = emptyItemTypeCounts();

  for (const group of groups) {
    const name = namesById.get(group.itemTypeId);

    if (name && isSystemItemTypeName(name)) {
      counts[name] += group._count._all;
    }
  }

  return counts;
});

export async function getItemStats(userId: string): Promise<ItemStats> {
  const [itemCount, favoriteItemCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { itemCount, favoriteItemCount };
}
