/**
 * Seeds the database.
 *
 * Run with:  npm run db:seed
 *
 * Two parts:
 *
 *   1. System item types — shared by every user (`userId` null, `isSystem`
 *      true). Seeded in every environment, since the app cannot create an item
 *      without one.
 *
 *   2. Demo data — a demo user with sample collections and items, for local
 *      development and demos. Skipped when NODE_ENV is "production": the
 *      password is published in context/features/seed-spec.md, so that account
 *      must never exist on the production branch.
 *
 * Both parts are idempotent. System types are matched on `name` + `userId:
 * null`, backed by the partial unique index from
 * migrations/20260909103127_system_item_type_unique_index. Collections and
 * items have no unique key, so the demo user is deleted first and the cascade
 * clears their whole graph before it is rebuilt.
 */
import "dotenv/config";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  SYSTEM_ITEM_TYPES,
  type SystemItemTypeName,
} from "@/lib/system-item-types";
import { DEMO_COLLECTIONS, DEMO_USER, type DemoItem } from "./demo-data";

const BCRYPT_ROUNDS = 12;

/** FILE-backed types are Pro-only and unused by the demo data. */
function contentTypeFor(type: SystemItemTypeName): "TEXT" | "URL" | "FILE" {
  if (type === "link") return "URL";
  if (type === "file" || type === "image") return "FILE";
  return "TEXT";
}

async function seedSystemItemTypes(): Promise<Map<SystemItemTypeName, string>> {
  console.log("System item types");

  for (const type of SYSTEM_ITEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
      select: { id: true },
    });

    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: { icon: type.icon, color: type.color, isSystem: true },
      });
    } else {
      await prisma.itemType.create({
        data: { ...type, isSystem: true, userId: null },
      });
    }
  }

  const rows = await prisma.itemType.findMany({ where: { userId: null } });

  if (rows.length !== SYSTEM_ITEM_TYPES.length) {
    throw new Error(
      `Expected ${SYSTEM_ITEM_TYPES.length} system item types, found ${rows.length}.`,
    );
  }

  console.log(`  ${rows.length} types ready`);
  return new Map(rows.map((row) => [row.name as SystemItemTypeName, row.id]));
}

async function createItem(
  item: DemoItem,
  userId: string,
  collectionId: string,
  typeIds: Map<SystemItemTypeName, string>,
): Promise<void> {
  const itemTypeId = typeIds.get(item.type);

  if (!itemTypeId) {
    throw new Error(`No seeded system type named "${item.type}".`);
  }

  await prisma.item.create({
    data: {
      title: item.title,
      contentType: contentTypeFor(item.type),
      content: item.content ?? null,
      url: item.url ?? null,
      description: item.description ?? null,
      language: item.language ?? null,
      isFavorite: item.isFavorite ?? false,
      isPinned: item.isPinned ?? false,
      userId,
      itemTypeId,
      collections: { create: { collectionId } },
    },
  });
}

async function seedDemoData(
  typeIds: Map<SystemItemTypeName, string>,
): Promise<void> {
  console.log("\nDemo data");

  // No unique key on collections or items, so a second run would duplicate
  // them. Removing the user first cascades to their whole graph.
  const { count } = await prisma.user.deleteMany({
    where: { email: DEMO_USER.email },
  });
  if (count > 0) {
    console.log("  removed previous demo user");
  }

  const user = await prisma.user.create({
    data: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      isPro: DEMO_USER.isPro,
      emailVerified: new Date(),
      hashedPassword: await bcrypt.hash(DEMO_USER.password, BCRYPT_ROUNDS),
    },
  });
  console.log(`  user ${user.email}`);

  let itemCount = 0;

  for (const collection of DEMO_COLLECTIONS) {
    const created = await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite ?? false,
        defaultTypeId: typeIds.get(collection.defaultType),
        userId: user.id,
      },
    });

    for (const item of collection.items) {
      await createItem(item, user.id, created.id, typeIds);
      itemCount += 1;
    }

    console.log(
      `  ${collection.name} — ${collection.items.length} item(s)`.padEnd(2),
    );
  }

  console.log(
    `\n  ${DEMO_COLLECTIONS.length} collections, ${itemCount} items total`,
  );
}

async function main(): Promise<void> {
  const typeIds = await seedSystemItemTypes();

  if (process.env.NODE_ENV === "production") {
    console.log(
      "\nSkipping demo data: NODE_ENV is production.\n" +
        "The demo password is public, so that account must not exist there.",
    );
    return;
  }

  await seedDemoData(typeIds);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
