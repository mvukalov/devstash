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
import { SYSTEM_ITEM_TYPES } from "@/lib/system-item-types";
import { DEMO_COLLECTIONS, DEMO_USER } from "../prisma/demo-data";

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

async function testSystemItemTypes(): Promise<void> {
  section("System item types");

  const types = await prisma.itemType.findMany({
    where: { userId: null },
    orderBy: { name: "asc" },
  });
  const byName = new Map(types.map((t) => [t.name, t]));

  check(
    `exactly ${SYSTEM_ITEM_TYPES.length} seeded`,
    types.length === SYSTEM_ITEM_TYPES.length,
    types.map((t) => t.name).join(", ") || "none — run `npm run db:seed`",
  );

  // Compared against the shared definition rather than a copy, so adding a
  // type to src/lib/system-item-types.ts without reseeding fails here.
  for (const expected of SYSTEM_ITEM_TYPES) {
    const actual = byName.get(expected.name);
    check(
      `${expected.name} — icon ${expected.icon}, colour ${expected.color}`,
      actual?.icon === expected.icon && actual?.color === expected.color,
      actual ? `got ${actual.icon}, ${actual.color}` : "missing",
    );
  }

  check("all flagged isSystem", types.every((t) => t.isSystem));

  // The partial unique index must reject a second system row with the same
  // name. The declarative @@unique([userId, name]) cannot, since NULLs are
  // distinct in Postgres — so this asserts the hand-written index is present.
  const rejected = await prisma.itemType
    .create({
      data: { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
    })
    .then(async (row) => {
      await prisma.itemType.delete({ where: { id: row.id } });
      return false;
    })
    .catch(() => true);
  check("partial unique index blocks duplicate system type", rejected);
}

async function testDemoData(): Promise<void> {
  section("Demo data");

  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
    include: {
      collections: { include: { items: true } },
      items: { include: { itemType: true, collections: true } },
    },
  });

  if (!user) {
    check("demo user seeded", false, "run `npm run db:seed`");
    return;
  }

  check("demo user seeded", true, user.email ?? "");
  check("profile matches spec", user.name === DEMO_USER.name && user.isPro === DEMO_USER.isPro);
  check("emailVerified set", user.emailVerified instanceof Date);
  check(
    "password hashed with bcrypt, 12 rounds",
    user.hashedPassword?.startsWith("$2b$12$") ?? false,
  );
  check(
    "password never stored in clear",
    user.hashedPassword !== DEMO_USER.password,
  );

  const expectedItems = DEMO_COLLECTIONS.reduce(
    (total, collection) => total + collection.items.length,
    0,
  );
  check(
    `${DEMO_COLLECTIONS.length} collections`,
    user.collections.length === DEMO_COLLECTIONS.length,
    `${user.collections.length} found`,
  );
  check(
    `${expectedItems} items`,
    user.items.length === expectedItems,
    `${user.items.length} found`,
  );

  const names = new Set(user.collections.map((c) => c.name));
  for (const collection of DEMO_COLLECTIONS) {
    const actual = user.collections.find((c) => c.name === collection.name);
    check(
      `${collection.name} — ${collection.items.length} item(s)`,
      names.has(collection.name) &&
        actual?.items.length === collection.items.length,
      actual ? `${actual.items.length} linked` : "missing",
    );
  }

  check(
    "every item sits in a collection",
    user.items.every((item) => item.collections.length > 0),
  );
  check(
    "every item uses a system type",
    user.items.every((item) => item.itemType.userId === null),
  );

  // contentType must agree with the payload: links carry a url and no content,
  // text types the reverse. A mismatch here means the seed built a bad row.
  const links = user.items.filter((item) => item.contentType === "URL");
  const texts = user.items.filter((item) => item.contentType === "TEXT");
  check(
    "URL items have a url and no content",
    links.length > 0 && links.every((item) => Boolean(item.url) && item.content === null),
    `${links.length} links`,
  );
  check(
    "TEXT items have content and no url",
    texts.length > 0 && texts.every((item) => Boolean(item.content) && item.url === null),
    `${texts.length} text items`,
  );
  check(
    "snippets carry a language",
    user.items
      .filter((item) => item.itemType.name === "snippet")
      .every((item) => Boolean(item.language)),
  );
}

/** First non-empty line of a block of content, trimmed to fit one row. */
function preview(text: string, width = 68): string {
  const line = text.split("\n").find((candidate) => candidate.trim()) ?? "";
  const trimmed = line.trim();
  return trimmed.length > width ? `${trimmed.slice(0, width - 1)}…` : trimmed;
}

function flags(item: { isPinned: boolean; isFavorite: boolean }): string {
  const set: string[] = [];
  if (item.isPinned) set.push("pinned");
  if (item.isFavorite) set.push("favorite");
  return set.length > 0 ? ` ${DIM}[${set.join(", ")}]${RESET}` : "";
}

/**
 * Reads the seeded demo data back out of the database and prints it, so a run
 * shows the actual stored rows rather than only asserting counts.
 */
async function showDemoData(): Promise<void> {
  section("Demo data — contents");

  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
    include: {
      collections: {
        orderBy: { createdAt: "asc" },
        include: {
          defaultType: true,
          items: {
            orderBy: { addedAt: "asc" },
            include: { item: { include: { itemType: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    console.log(`  ${DIM}no demo user — run \`npm run db:seed\`${RESET}`);
    return;
  }

  console.log(
    `  ${user.email} ${DIM}·${RESET} ${user.name} ${DIM}·${RESET} ` +
      `${user.isPro ? "pro" : "free"}\n`,
  );

  for (const collection of user.collections) {
    const favourite = collection.isFavorite ? ` ${DIM}[favorite]${RESET}` : "";
    console.log(`  ${collection.name}${favourite}`);
    console.log(`  ${DIM}${collection.description ?? ""}${RESET}`);
    console.log(
      `  ${DIM}default: ${collection.defaultType?.name ?? "none"} · ` +
        `${collection.items.length} item(s)${RESET}`,
    );

    for (const { item } of collection.items) {
      const type = item.itemType.name.padEnd(8);
      console.log(`    ${DIM}${type}${RESET} ${item.title}${flags(item)}`);

      const body = item.url ?? (item.content ? preview(item.content) : "");
      if (body) {
        console.log(`    ${" ".repeat(8)} ${DIM}${body}${RESET}`);
      }
    }

    console.log("");
  }
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

  // The item points at a seeded system type, which is the path the app will
  // actually take. A separate user-owned type exercises the cascade below.
  const systemType = await prisma.itemType.findFirstOrThrow({
    where: { name: "snippet", userId: null },
  });

  const customType = await prisma.itemType.create({
    data: {
      name: "test-custom",
      icon: "Code",
      color: "#3b82f6",
      userId: user.id,
    },
  });

  const collection = await prisma.collection.create({
    data: {
      name: "Test Collection",
      userId: user.id,
      defaultTypeId: customType.id,
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
      itemTypeId: systemType.id,
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
  check(
    "item linked to seeded system type",
    item.itemType.name === "snippet" &&
      item.itemType.userId === null &&
      item.itemType.isSystem,
  );
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
  check("user-owned itemTypes removed with user", itemTypes === 0);

  // Deleting a user must not take the shared system types with it, even
  // though that user's items referenced one of them.
  const survivors = await prisma.itemType.count({ where: { userId: null } });
  check(
    "system types survive user deletion",
    survivors === SYSTEM_ITEM_TYPES.length,
    `${survivors} remaining`,
  );
}

async function main(): Promise<void> {
  console.log(`DevStash — database test\n${"=".repeat(46)}`);

  const before = await readCounts();
  const email = `db-test-${Date.now()}@devstash.local`;
  let fixtureUserId: string | null = null;

  try {
    await testConnection();
    await testSchema();
    await testSystemItemTypes();
    await testDemoData();
    await showDemoData();

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
