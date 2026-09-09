/**
 * Database smoke test — verifies the Neon connection, the migrated schema and
 * the Prisma client end to end.
 *
 * Run with:  npm run db:test
 *
 * Reads DATABASE_URL from .env (the real file, not .env.example) via the
 * `dotenv/config` import below — plain scripts and the Prisma 7 CLI do not
 * load .env on their own.
 *
 * The test creates a throwaway user, exercises every relation, then deletes
 * that user and asserts the cascade removed everything, so it leaves the
 * database exactly as it found it.
 */
import "dotenv/config";

import { prisma } from "@/lib/prisma";

const GREEN = "[32m";
const RED = "[31m";
const DIM = "[2m";
const RESET = "[0m";

const EXPECTED_TABLES = [
  "Account",
  "Collection",
  "Item",
  "ItemCollection",
  "ItemTag",
  "ItemType",
  "Session",
  "Tag",
  "User",
  "VerificationToken",
] as const;

let failures = 0;

function check(label: string, passed: boolean, detail?: string): void {
  const mark = passed ? `${GREEN}pass${RESET}` : `${RED}FAIL${RESET}`;
  const suffix = detail ? ` ${DIM}(${detail})${RESET}` : "";
  console.log(`  ${mark}  ${label}${suffix}`);
  if (!passed) failures += 1;
}

function section(title: string): void {
  console.log(`\n${title}`);
}

async function testConnection(): Promise<void> {
  section("Connection");

  const [row] = await prisma.$queryRaw<{ db: string; version: string }[]>`
    SELECT current_database() AS db, version() AS version`;

  check("connected", Boolean(row.db), `database "${row.db}"`);
  check("postgres responding", row.version.startsWith("PostgreSQL"));
}

async function testSchema(): Promise<void> {
  section("Schema");

  const rows = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'`;
  const tables = new Set(rows.map((r) => r.table_name));

  for (const table of EXPECTED_TABLES) {
    check(`table ${table}`, tables.has(table));
  }

  const migrations = await prisma.$queryRaw<
    { migration_name: string; rolled_back_at: Date | null }[]
  >`SELECT migration_name, rolled_back_at FROM "_prisma_migrations"
    ORDER BY started_at`;

  check(
    "migrations applied and not rolled back",
    migrations.length > 0 && migrations.every((m) => m.rolled_back_at === null),
    migrations.map((m) => m.migration_name).join(", ") || "none",
  );
}

interface Counts {
  users: number;
  items: number;
  collections: number;
  tags: number;
  itemTypes: number;
}

async function readCounts(): Promise<Counts> {
  const [users, items, collections, tags, itemTypes] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
    prisma.itemType.count(),
  ]);
  return { users, items, collections, tags, itemTypes };
}

/** Creates a full object graph for one throwaway user and returns its id. */
async function createFixture(email: string): Promise<string> {
  const user = await prisma.user.create({ data: { email, name: "DB Test" } });

  const itemType = await prisma.itemType.create({
    data: {
      name: "test-snippet",
      icon: "Code",
      color: "#3b82f6",
      userId: user.id,
    },
  });

  const collection = await prisma.collection.create({
    data: {
      name: "Test Collection",
      userId: user.id,
      defaultTypeId: itemType.id,
    },
  });

  const tag = await prisma.tag.create({
    data: { name: "test-tag", userId: user.id },
  });

  await prisma.item.create({
    data: {
      title: "Test Snippet",
      contentType: "TEXT",
      content: "console.log('devstash');",
      language: "ts",
      isPinned: true,
      userId: user.id,
      itemTypeId: itemType.id,
      collections: { create: { collectionId: collection.id } },
      tags: { create: { tagId: tag.id } },
    },
  });

  return user.id;
}

async function testWritesAndRelations(userId: string): Promise<void> {
  section("Writes & relations");

  const item = await prisma.item.findFirstOrThrow({
    where: { userId },
    include: {
      itemType: true,
      collections: { include: { collection: true } },
      tags: { include: { tag: true } },
    },
  });

  check("item created", item.title === "Test Snippet");
  check("ContentType enum round-trips", item.contentType === "TEXT");
  check("itemType relation", item.itemType.name === "test-snippet");
  check(
    "collection join table",
    item.collections[0]?.collection.name === "Test Collection",
  );
  check("ItemCollection.addedAt default", item.collections[0]?.addedAt instanceof Date);
  check("tag join table", item.tags[0]?.tag.name === "test-tag");
  check("column defaults", item.isPinned && !item.isFavorite);
  check("timestamps populated", item.createdAt instanceof Date);
  check("nullable columns stay null", item.url === null && item.fileUrl === null);

  const pinned = await prisma.item.findMany({
    where: { userId, isPinned: true },
  });
  check("indexed lookup (userId, isPinned)", pinned.length === 1);

  const unique = await prisma.tag
    .create({ data: { name: "test-tag", userId } })
    .then(() => false)
    .catch(() => true);
  check("unique constraint (userId, name) on Tag", unique);
}

async function testCascadeDelete(userId: string): Promise<void> {
  section("Cascade delete");

  await prisma.user.delete({ where: { id: userId } });

  const [items, collections, tags, itemTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.tag.count({ where: { userId } }),
    prisma.itemType.count({ where: { userId } }),
  ]);

  check("items removed with user", items === 0);
  check("collections removed with user", collections === 0);
  check("tags removed with user", tags === 0);
  check("itemTypes removed with user", itemTypes === 0);
}

async function main(): Promise<void> {
  console.log(`DevStash — database test\n${"=".repeat(46)}`);

  const before = await readCounts();
  const email = `db-test-${Date.now()}@devstash.local`;
  let fixtureUserId: string | null = null;

  try {
    await testConnection();
    await testSchema();

    fixtureUserId = await createFixture(email);
    await testWritesAndRelations(fixtureUserId);
    await testCascadeDelete(fixtureUserId);
    fixtureUserId = null;

    section("Cleanup");
    const after = await readCounts();
    const unchanged = (Object.keys(before) as (keyof Counts)[]).every(
      (key) => before[key] === after[key],
    );
    check("database left unchanged", unchanged, JSON.stringify(after));
  } finally {
    // If an assertion threw mid-run, still remove the throwaway user.
    if (fixtureUserId) {
      await prisma.user.delete({ where: { id: fixtureUserId } }).catch(() => {});
      console.log("\n  (removed test fixture after failure)");
    }
  }

  console.log("=".repeat(46));
  if (failures > 0) {
    console.error(`${RED}${failures} check(s) failed${RESET}`);
    process.exitCode = 1;
  } else {
    console.log(`${GREEN}All checks passed${RESET}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error("\nTest run failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
