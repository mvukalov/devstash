import type { Metadata } from "next";

import { CollectionCard } from "@/components/dashboard/collection-card";
import { getAllCollections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/user";

export const metadata: Metadata = {
  title: "Collections · DevStash",
};

/** Every collection the user owns — the target of the sidebar's "View all". */
export default async function CollectionsPage() {
  const user = await getCurrentUser();
  const collections = user ? await getAllCollections(user.id) : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
        <p className="text-muted-foreground mt-1">
          {collections.length}{" "}
          {collections.length === 1 ? "collection" : "collections"}
        </p>
      </div>

      {collections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No collections yet. Create one to start stashing.
        </p>
      )}
    </div>
  );
}
