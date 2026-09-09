import type { Metadata } from "next";
import { Clock, Pin } from "lucide-react";

import { CollectionCard } from "@/components/dashboard/collection-card";
import { ItemRow } from "@/components/dashboard/item-row";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { collections, items } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard · DevStash",
};

const RECENT_COLLECTION_LIMIT = 6;
const RECENT_ITEM_LIMIT = 10;

export default function DashboardPage() {
  const recentCollections = [...collections]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_COLLECTION_LIMIT);

  const pinnedItems = items.filter((item) => item.isPinned);

  const recentItems = [...items]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, RECENT_ITEM_LIMIT);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your developer knowledge hub
        </p>
      </div>

      <StatsCards
        itemCount={items.length}
        collectionCount={collections.length}
        favoriteItemCount={items.filter((item) => item.isFavorite).length}
        favoriteCollectionCount={
          collections.filter((collection) => collection.isFavorite).length
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Collections</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Pin className="size-4" />
          Pinned
        </h2>
        <div className="space-y-3">
          {pinnedItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Clock className="size-4" />
          Recent
        </h2>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
