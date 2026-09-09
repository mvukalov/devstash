import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  TYPE_BORDER_CLASSES,
  TYPE_ICONS,
  TYPE_TILE_CLASSES,
  getItemType,
} from "@/lib/item-types";
import { formatShortDate } from "@/lib/format";
import type { Item } from "@/lib/mock-data";

interface ItemRowProps {
  item: Item;
}

/** One item in the pinned / recent lists. Border colour tracks the item type. */
export function ItemRow({ item }: ItemRowProps) {
  const type = getItemType(item.itemTypeId);
  const Icon = TYPE_ICONS[type.name];

  return (
    <Card
      size="sm"
      className={`flex-row items-start gap-3 border-l-4 px-4 transition-colors hover:bg-muted/40 ${TYPE_BORDER_CLASSES[type.name]}`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${TYPE_TILE_CLASSES[type.name]}`}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{item.title}</span>
          {item.isPinned ? (
            <Pin className="text-muted-foreground size-3.5 shrink-0" />
          ) : null}
          {item.isFavorite ? (
            <Star className="fill-type-note text-type-note size-3.5 shrink-0" />
          ) : null}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {item.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <time
        dateTime={item.updatedAt}
        className="text-muted-foreground shrink-0 text-xs"
      >
        {formatShortDate(item.updatedAt)}
      </time>
    </Card>
  );
}
