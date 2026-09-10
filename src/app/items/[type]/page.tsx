import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getItemTypeCounts } from "@/lib/db/items";
import { getCurrentUser } from "@/lib/db/user";
import {
  TYPE_ICONS,
  TYPE_LABELS,
  TYPE_TEXT_CLASSES,
  itemTypeFromSlug,
} from "@/lib/item-types";

export async function generateMetadata({
  params,
}: PageProps<"/items/[type]">): Promise<Metadata> {
  const { type } = await params;
  const name = itemTypeFromSlug(type);

  return { title: `${name ? TYPE_LABELS[name] : "Items"} · DevStash` };
}

export default async function ItemsByTypePage({
  params,
}: PageProps<"/items/[type]">) {
  const { type } = await params;
  const name = itemTypeFromSlug(type);

  if (!name) {
    notFound();
  }

  const user = await getCurrentUser();
  const counts = user ? await getItemTypeCounts(user.id) : null;
  const itemCount = counts?.[name] ?? 0;
  const Icon = TYPE_ICONS[name];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <Icon className={`size-7 ${TYPE_TEXT_CLASSES[name]}`} />
        {TYPE_LABELS[name]}
      </h1>
      <p className="text-muted-foreground mt-1">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      {/* The filtered item list is a later milestone. */}
    </div>
  );
}
