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

import type { ItemTypeName } from "@/lib/mock-data";

type IconComponent = typeof Code;

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

/** URL slug for a type — the plural used by `/items/[type]`, e.g. "snippets". */
export function itemTypeSlug(name: ItemTypeName): string {
  return `${name}s`;
}
