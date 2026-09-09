import { Folder, FolderHeart, Star, Boxes } from "lucide-react";

import { Card } from "@/components/ui/card";

interface StatsCardsProps {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
}

/** Four counters across the top of the dashboard. */
export function StatsCards({
  itemCount,
  collectionCount,
  favoriteItemCount,
  favoriteCollectionCount,
}: StatsCardsProps) {
  const stats = [
    { label: "Items", value: itemCount, icon: Boxes },
    { label: "Collections", value: collectionCount, icon: Folder },
    { label: "Favorite items", value: favoriteItemCount, icon: Star },
    {
      label: "Favorite collections",
      value: favoriteCollectionCount,
      icon: FolderHeart,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="flex-row items-center gap-3 px-4">
          <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {value}
            </p>
            <p className="text-muted-foreground truncate text-xs">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
