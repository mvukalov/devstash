/**
 * Presentation helpers for item types.
 *
 * The colour hexes live in `globals.css` as `--color-type-*` theme tokens so
 * they can be used as Tailwind classes; the maps here keep the class names
 * static, which Tailwind's scanner requires.
 */

import {
  Code,
  File,
  Image,
  Link,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

import { itemTypes, type ItemType } from "@/lib/mock-data";
import type { SystemItemTypeName as ItemTypeName } from "@/lib/system-item-types";

type IconComponent = typeof Code;

export const TYPE_LABELS: Record<ItemTypeName, string> = {
  snippet: "Snippets",
  prompt: "Prompts",
  command: "Commands",
  note: "Notes",
  file: "Files",
  image: "Images",
  link: "Links",
};

export const TYPE_ICONS: Record<ItemTypeName, IconComponent> = {
  snippet: Code,
  prompt: Sparkles,
  command: Terminal,
  note: StickyNote,
  file: File,
  image: Image,
  link: Link,
};

export const TYPE_TEXT_CLASSES: Record<ItemTypeName, string> = {
  snippet: "text-type-snippet",
  prompt: "text-type-prompt",
  command: "text-type-command",
  note: "text-type-note",
  file: "text-type-file",
  image: "text-type-image",
  link: "text-type-link",
};

export const TYPE_BORDER_CLASSES: Record<ItemTypeName, string> = {
  snippet: "border-l-type-snippet",
  prompt: "border-l-type-prompt",
  command: "border-l-type-command",
  note: "border-l-type-note",
  file: "border-l-type-file",
  image: "border-l-type-image",
  link: "border-l-type-link",
};

export const TYPE_TILE_CLASSES: Record<ItemTypeName, string> = {
  snippet: "bg-type-snippet/10 text-type-snippet",
  prompt: "bg-type-prompt/10 text-type-prompt",
  command: "bg-type-command/10 text-type-command",
  note: "bg-type-note/10 text-type-note",
  file: "bg-type-file/10 text-type-file",
  image: "bg-type-image/10 text-type-image",
  link: "bg-type-link/10 text-type-link",
};

/** URL slug for a type — the plural used by `/items/[type]`, e.g. "snippets". */
export function itemTypeSlug(name: ItemTypeName): string {
  return `${name}s`;
}

/** Look up a type by id. Ids come from the same seed data, so a miss is a bug. */
export function getItemType(id: string): ItemType {
  const type = itemTypes.find((itemType) => itemType.id === id);

  if (!type) {
    throw new Error(`Unknown item type: ${id}`);
  }

  return type;
}
