/**
 * Collection queries for the dashboard.
 *
 * Server-only: these run in server components via the Prisma singleton.
 */
import "server-only";

import { Prisma } from "@/generated/prisma/client";
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

type TypeCounts = Map<SystemItemTypeName, number>;

/**
 * Orders a collection's types by how many items use each, so the first entry
 * is the dominant type. Ties fall back to the canonical order in
 * SYSTEM_ITEM_TYPE_NAMES, which keeps the icon row stable between renders.
 */
function rankTypes(counts: TypeCounts | undefined): SystemItemTypeName[] {
  if (!counts) return [];

  return [...counts.entries()]
    .sort(
      ([aName, aCount], [bName, bCount]) =>
        bCount - aCount ||
        SYSTEM_ITEM_TYPE_NAMES.indexOf(aName) -
          SYSTEM_ITEM_TYPE_NAMES.indexOf(bName),
    )
    .map(([name]) => name);
}

interface TypeCountRow {
  collectionId: string;
  name: string;
  count: number;
}

/**
 * Item count per type for each collection, keyed by collection id. One grouped
 * query, so the database returns a row per (collection, type) rather than one
 * per item.
 */
async function getTypeCountsByCollection(
  collectionIds: string[],
): Promise<Map<string, TypeCounts>> {
  const byCollection = new Map<string, TypeCounts>();
  if (collectionIds.length === 0) return byCollection;

  const rows = await prisma.$queryRaw<TypeCountRow[]>`
    SELECT ic."collectionId", it."name", COUNT(*)::int AS "count"
    FROM "ItemCollection" ic
    JOIN "Item" i ON i."id" = ic."itemId"
    JOIN "ItemType" it ON it."id" = i."itemTypeId"
    WHERE ic."collectionId" IN (${Prisma.join(collectionIds)})
    GROUP BY ic."collectionId", it."name"
  `;

  for (const { collectionId, name, count } of rows) {
    // Custom types are a later Pro feature and have no colour/icon mapping yet.
    if (!isSystemItemTypeName(name)) continue;

    const counts: TypeCounts = byCollection.get(collectionId) ?? new Map();
    counts.set(name, count);
    byCollection.set(collectionId, counts);
  }

  return byCollection;
}

const COLLECTION_SELECT = {
  id: true,
  name: true,
  description: true,
  isFavorite: true,
  createdAt: true,
  _count: { select: { items: true } },
} as const;

/**
 * Collections newest first, with their types ranked. Two queries however many
 * collections or items there are: the collections with their item counts, then
 * the grouped type counts for all of them.
 */
async function findCollections(
  where: { userId: string; isFavorite?: boolean },
  limit?: number,
): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: COLLECTION_SELECT,
  });

  const typeCounts = await getTypeCountsByCollection(
    collections.map(({ id }) => id),
  );

  return collections.map(({ _count, ...collection }) => ({
    ...collection,
    itemCount: _count.items,
    typeNames: rankTypes(typeCounts.get(collection.id)),
  }));
}

/** The user's most recently created collections, newest first. */
export async function getRecentCollections(
  userId: string,
  limit: number,
): Promise<CollectionSummary[]> {
  return findCollections({ userId }, limit);
}

/** Every collection the user owns, newest first — the `/collections` page. */
export async function getAllCollections(
  userId: string,
): Promise<CollectionSummary[]> {
  return findCollections({ userId });
}

export interface SidebarCollections {
  favorites: CollectionSummary[];
  recent: CollectionSummary[];
}

/**
 * The two sidebar lists. Favourites are excluded from Recent so a collection
 * never appears twice.
 */
export async function getSidebarCollections(
  userId: string,
  recentLimit: number,
): Promise<SidebarCollections> {
  const [favorites, recent] = await Promise.all([
    findCollections({ userId, isFavorite: true }),
    findCollections({ userId, isFavorite: false }, recentLimit),
  ]);

  return { favorites, recent };
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
