import { Box, Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ItemSummary } from "@/lib/db/items";
import {
  TYPE_BORDER_CLASSES,
  TYPE_ICONS,
  TYPE_TILE_CLASSES,
} from "@/lib/item-types";
import { formatShortDate } from "@/lib/format";

interface ItemRowProps {
  item: ItemSummary;
}

/** One item in the pinned / recent lists. Border colour tracks the item type. */
export function ItemRow({ item }: ItemRowProps) {
  // A custom type (a later Pro feature) has no colour or icon of its own yet.
  const Icon = item.typeName ? TYPE_ICONS[item.typeName] : Box;
  const borderClass = item.typeName
    ? TYPE_BORDER_CLASSES[item.typeName]
    : "border-l-border";
  const tileClass = item.typeName
    ? TYPE_TILE_CLASSES[item.typeName]
    : "bg-muted text-muted-foreground";

  return (
    <Card
      size="sm"
      className={`flex-row items-start gap-3 border-l-4 px-4 transition-colors hover:bg-muted/40 ${borderClass}`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tileClass}`}
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
        {item.description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {item.description}
          </p>
        ) : null}

        {item.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <time
        dateTime={item.updatedAt.toISOString()}
        className="text-muted-foreground shrink-0 text-xs"
      >
        {formatShortDate(item.updatedAt)}
      </time>
    </Card>
  );
}
