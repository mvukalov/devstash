import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma into this file, and the
// CLI no longer loads .env on its own — hence the `dotenv/config` import above.
//
// The CLI (migrate / studio) uses DIRECT_URL: Neon's pooled endpoint runs
// PgBouncer in transaction mode, which breaks the advisory locks and session
// state that migrations rely on. The app itself uses the pooled DATABASE_URL
// (see src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 no longer seeds automatically after `migrate dev` / `migrate
    // reset`; run it explicitly with `npm run db:seed`.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Deliberately not the `env()` helper from prisma/config: it resolves
    // eagerly and throws while merely loading this file, which breaks
    // `prisma generate` (no database needed) in CI and on Vercel, where only
    // build-time vars are present. Commands that do need a connection still
    // fail with a clear Prisma error when this is empty.
    url: process.env.DIRECT_URL ?? "",
  },
});
