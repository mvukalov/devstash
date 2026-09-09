import { MoreHorizontal, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CollectionSummary } from "@/lib/db/collections";
import {
  TYPE_BORDER_CLASSES,
  TYPE_LABELS,
  TYPE_TEXT_CLASSES,
  TYPE_ICONS,
} from "@/lib/item-types";

interface CollectionCardProps {
  collection: CollectionSummary;
}

/** Collection card — the left border takes the dominant type's colour. */
export function CollectionCard({ collection }: CollectionCardProps) {
  const [dominantType] = collection.typeNames;

  return (
    <Card
      className={`gap-3 border-l-4 transition-colors hover:bg-muted/40 ${
        dominantType ? TYPE_BORDER_CLASSES[dominantType] : "border-l-border"
      }`}
    >
      <div className="flex items-start gap-2 px-4">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 font-medium">
            <span className="truncate">{collection.name}</span>
            {collection.isFavorite ? (
              <Star className="fill-type-note text-type-note size-3.5 shrink-0" />
            ) : null}
          </h3>
          <p className="text-muted-foreground text-xs">
            {collection.itemCount}{" "}
            {collection.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Collection actions">
          <MoreHorizontal />
        </Button>
      </div>

      {collection.description ? (
        <p className="text-muted-foreground line-clamp-2 px-4 text-sm">
          {collection.description}
        </p>
      ) : null}

      <div className="flex min-h-4 items-center gap-2 px-4">
        {collection.typeNames.map((name) => {
          const Icon = TYPE_ICONS[name];

          return (
            <Icon
              key={name}
              aria-label={TYPE_LABELS[name]}
              className={`size-4 ${TYPE_TEXT_CLASSES[name]}`}
            />
          );
        })}
      </div>
    </Card>
  );
}
