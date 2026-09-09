/**
 * Item queries for the dashboard.
 *
 * Server-only: these run in server components via the Prisma singleton.
 */
import { prisma } from "@/lib/prisma";
import {
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

type ItemRow = {
  itemType: { name: string };
  tags: { tag: { name: string } }[];
} & Omit<ItemSummary, "typeName" | "tags">;

function toSummary({ itemType, tags, ...item }: ItemRow): ItemSummary {
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

export async function getItemStats(userId: string): Promise<ItemStats> {
  const [itemCount, favoriteItemCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { itemCount, favoriteItemCount };
}
