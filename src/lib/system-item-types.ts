/**
 * The system item types — the single source of truth.
 *
 * Seeded into the database by prisma/seed.ts and asserted by
 * scripts/test-db.ts, so the two can never drift. Pure data: this module must
 * stay free of side effects and of any Prisma or React import, because both a
 * standalone script and the app import it.
 *
 * System types are shared by every user (`userId = null`, `isSystem = true`).
 * User-owned custom types are a later Pro feature and are not listed here.
 *
 * The colours mirror the `--color-type-*` tokens in src/app/globals.css and the
 * table in context/project-overview.md; the icons are lucide-react names, which
 * src/lib/item-types.ts maps to actual components.
 */

export const SYSTEM_ITEM_TYPE_NAMES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
] as const;

export type SystemItemTypeName = (typeof SYSTEM_ITEM_TYPE_NAMES)[number];

export interface SystemItemType {
  name: SystemItemTypeName;
  /** lucide-react icon name, e.g. "Code". */
  icon: string;
  /** Hex colour, e.g. "#3b82f6". */
  color: string;
}

export const SYSTEM_ITEM_TYPES: SystemItemType[] = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];
