import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TYPE_ICONS, TYPE_TEXT_CLASSES, itemTypeSlug } from "@/lib/item-types";
import { itemTypes } from "@/lib/mock-data";

function findTypeBySlug(slug: string) {
  return itemTypes.find((type) => itemTypeSlug(type.name) === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/items/[type]">): Promise<Metadata> {
  const { type } = await params;
  const itemType = findTypeBySlug(type);

  return { title: `${itemType?.label ?? "Items"} · DevStash` };
}

export default async function ItemsByTypePage({
  params,
}: PageProps<"/items/[type]">) {
  const { type } = await params;
  const itemType = findTypeBySlug(type);

  if (!itemType) {
    notFound();
  }

  const Icon = TYPE_ICONS[itemType.name];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <Icon className={`size-7 ${TYPE_TEXT_CLASSES[itemType.name]}`} />
        {itemType.label}
      </h1>
      <p className="text-muted-foreground mt-1">{itemType.itemCount} items</p>

      {/* The filtered item list is a later milestone. */}
    </div>
  );
}
