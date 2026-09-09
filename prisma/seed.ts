/**
 * Seeds the system item types.
 *
 * Run with:  npm run db:seed
 *
 * System types are shared by every user: `userId` is null and `isSystem` is
 * true. They are the single source of truth for type names — the frontend
 * (src/lib/item-types.ts) maps those names to lucide icons and Tailwind
 * classes, so the two lists must stay in step.
 *
 * The seed is idempotent. It cannot use `upsert` on the declarative
 * `@@unique([userId, name])`, because Postgres treats NULLs as distinct and
 * that key does not identify a system row. It matches on
 * `name` + `userId: null` instead, backed by the partial unique index added in
 * migrations/20260909103127_system_item_type_unique_index.
 */
import "dotenv/config";

import { prisma } from "@/lib/prisma";
import {
  SYSTEM_ITEM_TYPES,
  type SystemItemType,
} from "@/lib/system-item-types";

async function seedSystemItemType(
  type: SystemItemType,
): Promise<"created" | "updated"> {
  const existing = await prisma.itemType.findFirst({
    where: { name: type.name, userId: null },
    select: { id: true },
  });

  if (existing) {
    await prisma.itemType.update({
      where: { id: existing.id },
      data: { icon: type.icon, color: type.color, isSystem: true },
    });
    return "updated";
  }

  await prisma.itemType.create({
    data: { ...type, isSystem: true, userId: null },
  });
  return "created";
}

async function main(): Promise<void> {
  let created = 0;
  let updated = 0;

  for (const type of SYSTEM_ITEM_TYPES) {
    const result = await seedSystemItemType(type);
    if (result === "created") created += 1;
    else updated += 1;
    console.log(`  ${result.padEnd(7)} ${type.name}`);
  }

  const total = await prisma.itemType.count({ where: { userId: null } });
  console.log(
    `\nSystem item types: ${created} created, ${updated} updated, ${total} total.`,
  );

  if (total !== SYSTEM_ITEM_TYPES.length) {
    throw new Error(
      `Expected ${SYSTEM_ITEM_TYPES.length} system item types, found ${total}.`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
