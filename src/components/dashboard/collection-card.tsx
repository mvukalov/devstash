import { MoreHorizontal, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TYPE_BORDER_CLASSES,
  TYPE_TEXT_CLASSES,
  TYPE_ICONS,
  getItemType,
} from "@/lib/item-types";
import type { Collection } from "@/lib/mock-data";

interface CollectionCardProps {
  collection: Collection;
}

/** Collection card — the left border takes the dominant type's colour. */
export function CollectionCard({ collection }: CollectionCardProps) {
  const [dominantTypeId] = collection.typeIds;
  const dominantType = getItemType(dominantTypeId);

  return (
    <Card
      className={`gap-3 border-l-4 transition-colors hover:bg-muted/40 ${TYPE_BORDER_CLASSES[dominantType.name]}`}
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
            {collection.itemCount} items
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Collection actions">
          <MoreHorizontal />
        </Button>
      </div>

      <p className="text-muted-foreground line-clamp-2 px-4 text-sm">
        {collection.description}
      </p>

      <div className="flex items-center gap-2 px-4">
        {collection.typeIds.map((typeId) => {
          const type = getItemType(typeId);
          const Icon = TYPE_ICONS[type.name];

          return (
            <Icon
              key={typeId}
              aria-label={type.label}
              className={`size-4 ${TYPE_TEXT_CLASSES[type.name]}`}
            />
          );
        })}
      </div>
    </Card>
  );
}
