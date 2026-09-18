/**
 * Deletes every user except the seeded demo account, along with everything they
 * own — items, collections, tags, their own item types, OAuth accounts,
 * sessions and any outstanding email verification tokens.
 *
 * Run with:  npm run db:delete-users          (dry run — shows what would go)
 *            npm run db:delete-users -- --yes (actually deletes)
 *
 * Reads DATABASE_URL from .env via the `dotenv/config` import, like the other
 * scripts here — plain scripts and the Prisma 7 CLI do not load .env on their
 * own.
 *
 * Most of the deleting is done by the database: every user-owned table has
 * `onDelete: Cascade` on its `userId`, so removing the User row clears its
 * whole graph. The two things that are NOT covered by a cascade, and so are
 * handled explicitly below:
 *
 *   - VerificationToken, which has no relation to User at all (it is keyed by
 *     email address, so it survives the user it was issued for).
 *   - System item types, which have `userId = null` and must survive — they are
 *     shared by every account and the app cannot create an item without one.
 */
import "dotenv/config";

import { prisma } from "@/lib/prisma";
import { DEMO_USER } from "../prisma/demo-data";

const GREEN = "[32m";
const RED = "[31m";
const YELLOW = "[33m";
const DIM = "[2m";
const RESET = "[0m";

/**
 * The production compute, per the project notes. This script is destructive and
 * irreversible, so it refuses to run against it even if someone points .env
 * there by accident.
 */
const PRODUCTION_ENDPOINT = "ep-late-bonus-ax3d0401";

const KEEP_EMAIL = DEMO_USER.email.toLowerCase();

function assertNotProduction(): void {
  const urls = [process.env.DATABASE_URL, process.env.DIRECT_URL];

  if (urls.some((url) => url?.includes(PRODUCTION_ENDPOINT))) {
    throw new Error(
      `Refusing to run: the connection points at the production endpoint (${PRODUCTION_ENDPOINT}).`,
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run with NODE_ENV=production.");
  }
}

async function main(): Promise<void> {
  const confirmed = process.argv.includes("--yes");

  assertNotProduction();

  console.log("=".repeat(46));
  console.log(`Delete users  ${DIM}(keeping ${KEEP_EMAIL})${RESET}`);
  console.log("=".repeat(46));

  // Anyone whose email is not the demo address, including rows with no email at
  // all — an OAuth account whose provider returned none is still not the demo
  // user. Matched case-insensitively, since `User.email` is a plain unique
  // column and an OAuth row can be stored in mixed case.
  const doomed = await prisma.user.findMany({
    where: { NOT: { email: { equals: KEEP_EMAIL, mode: "insensitive" } } },
    select: {
      id: true,
      email: true,
      name: true,
      _count: {
        select: {
          items: true,
          collections: true,
          tags: true,
          itemTypes: true,
          accounts: true,
          sessions: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (doomed.length === 0) {
    console.log("\nNothing to delete — no users besides the demo account.\n");
    return;
  }

  console.log(`\n${doomed.length} user(s):\n`);

  for (const user of doomed) {
    const owned = [
      `${user._count.items} items`,
      `${user._count.collections} collections`,
      `${user._count.tags} tags`,
      `${user._count.itemTypes} custom types`,
      `${user._count.accounts} accounts`,
      `${user._count.sessions} sessions`,
    ].join(", ");

    console.log(`  ${user.email ?? "(no email)"}  ${DIM}${owned}${RESET}`);
  }

  // Tokens are keyed by email rather than by user id, so they have to be
  // matched the same way — by address, everything except the demo account's.
  const doomedTokens = await prisma.verificationToken.count({
    where: { NOT: { identifier: { equals: KEEP_EMAIL, mode: "insensitive" } } },
  });

  console.log(`\n  ${doomedTokens} verification token(s)`);

  if (!confirmed) {
    console.log(
      `\n${YELLOW}Dry run.${RESET} Nothing was deleted. Re-run with --yes to delete:\n`,
    );
    console.log("  npm run db:delete-users -- --yes\n");
    return;
  }

  // One transaction, so a failure part-way through cannot leave half the
  // accounts gone.
  const [tokens, users] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: {
        NOT: { identifier: { equals: KEEP_EMAIL, mode: "insensitive" } },
      },
    }),
    prisma.user.deleteMany({
      where: { id: { in: doomed.map((user) => user.id) } },
    }),
  ]);

  console.log(
    `\n${GREEN}Deleted${RESET} ${users.count} user(s) and ${tokens.count} verification token(s).`,
  );

  const [remainingUsers, systemTypes] = await Promise.all([
    prisma.user.findMany({
      select: { email: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.itemType.count({ where: { userId: null } }),
  ]);

  console.log(
    `\nRemaining: ${remainingUsers.length} user(s) ${DIM}(${remainingUsers
      .map((user) => user.email ?? "(no email)")
      .join(", ")})${RESET}`,
  );
  console.log(`System item types intact: ${systemTypes}\n`);
}

main()
  .catch((error: unknown) => {
    console.error(`\n${RED}Failed:${RESET}`, error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
