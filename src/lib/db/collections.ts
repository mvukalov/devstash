/**
 * Collection queries for the dashboard.
 *
 * Server-only: these run in server components via the Prisma singleton.
 */
import { prisma } from "@/lib/prisma";
import {
  SYSTEM_ITEM_TYPE_NAMES,
  isSystemItemTypeName,
  type SystemItemTypeName,
} from "@/lib/system-item-types";

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Types present in the collection, most-used first — drives the card accent. */
  typeNames: SystemItemTypeName[];
  createdAt: Date;
}

export interface CollectionStats {
  collectionCount: number;
  favoriteCollectionCount: number;
}

/**
 * Orders the types found in a collection by how many items use each, so the
 * first entry is the dominant type. Ties fall back to the canonical order in
 * SYSTEM_ITEM_TYPE_NAMES, which keeps the icon row stable between renders.
 */
function rankTypes(names: string[]): SystemItemTypeName[] {
  const counts = new Map<SystemItemTypeName, number>();

  for (const name of names) {
    // Custom types are a later Pro feature and have no colour/icon mapping yet.
    if (!isSystemItemTypeName(name)) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(
      ([aName, aCount], [bName, bCount]) =>
        bCount - aCount ||
        SYSTEM_ITEM_TYPE_NAMES.indexOf(aName) -
          SYSTEM_ITEM_TYPE_NAMES.indexOf(bName),
    )
    .map(([name]) => name);
}

/** The user's most recently created collections, newest first. */
export async function getRecentCollections(
  userId: string,
  limit: number,
): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      createdAt: true,
      items: {
        select: { item: { select: { itemType: { select: { name: true } } } } },
      },
    },
  });

  return collections.map(({ items, ...collection }) => ({
    ...collection,
    itemCount: items.length,
    typeNames: rankTypes(items.map(({ item }) => item.itemType.name)),
  }));
}

export async function getCollectionStats(
  userId: string,
): Promise<CollectionStats> {
  const [collectionCount, favoriteCollectionCount] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { collectionCount, favoriteCollectionCount };
}
