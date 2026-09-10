# Current Feature

<!-- Feature Name -->

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

<!-- Format: each step gets a comment heading `<!-- N. Title (spec-file.md) -->` naming the spec in context/features/ it came from, or `(no spec file)` if there wasn't one -->

<!-- 1. Project setup (no spec file) -->

1. Project setup and boilerplate cleanup

<!-- 2. Next.js scaffold (no spec file) -->

2. Initial Next.js 16.3.4 setup — App Router (`src/app`), React 19.2.8, TypeScript, Tailwind CSS v4 (PostCSS), ESLint 9 flat config

<!-- 3. Mock data (no spec file) -->

3. Mock data for the dashboard UI (`src/lib/mock-data.ts`)

<!-- 4. Dashboard UI — Phase 1 (dashboard-phase-1-spec.md) -->

4. Dashboard UI Phase 1 (@context/features/dashboard-phase-1-spec.md) — shadcn/ui init (radix base, nova preset, neutral, CSS variables), UI components installed, `/dashboard` route with sidebar + top bar shell, dark mode by default, display-only search and New Collection / New Item buttons, `h2` placeholders for sidebar and main

<!-- 5. Dashboard UI — Phase 2 (dashboard-phase-2-spec.md) -->

5. Dashboard UI Phase 2 (@context/features/dashboard-phase-2-spec.md) — shadcn `sidebar`/`collapsible` installed, sidebar with collapsible Types (linking to `/items/[type]`) and Collections (favorites + recent) groups, user footer, top-bar toggle, offcanvas on desktop and Sheet drawer on mobile, open state persisted in the `sidebar_state` cookie; type accent colours added to `globals.css` as `--color-type-*`; `DashboardShell` shared by `/dashboard` and `/items`; `useIsMobile` rewritten with `useSyncExternalStore` to satisfy the `set-state-in-effect` lint rule

<!-- 6. Dashboard UI — Phase 3 (dashboard-phase-3-spec.md) -->

6. Dashboard UI Phase 3 (@context/features/dashboard-phase-3-spec.md) — dashboard main area: 4 stats cards (items, collections, favorite items, favorite collections), recent collections grid with type-coloured left borders and type icon row, pinned items list, 10 most recent items; new `CollectionCard` / `ItemRow` / `StatsCards` components, `getItemType` + border/tile colour maps in `lib/item-types.ts`, and `formatShortDate` in `lib/format.ts` (fixed locale/UTC to avoid hydration drift)

<!-- 7. Database — Neon + Prisma 7 (database-spec.md) -->

7. Database — Neon PostgreSQL + Prisma 7 (@context/features/database-spec.md) — Prisma pinned to exact `7.10.0` (npm's `latest` tag currently points at the `8.0.0-rc.13` release candidate, and prisma.io docs have already moved to v8, so v7 docs live under `/docs/orm/v7/`); new Rust-free `prisma-client` generator outputting to `src/generated/prisma` (gitignored, rebuilt by a `postinstall` script), `@prisma/adapter-pg` driver adapter (required in v7 — `new PrismaClient()` without one throws), `prisma.config.ts` owning the datasource URL with an explicit `dotenv/config` import since the v7 CLI no longer loads `.env`; two Neon connection strings — pooled `DATABASE_URL` for the app, direct `DIRECT_URL` for the CLI (PgBouncer transaction mode breaks the advisory locks migrations need); `prisma.config.ts` reads `process.env.DIRECT_URL` rather than the `env()` helper, which resolves eagerly and would break credential-free `prisma generate` in CI/Vercel; full schema (10 models + `ContentType` enum, NextAuth models, explicit `ItemCollection`/`ItemTag` join tables), FK indexes and cascade deletes, initial migration `20260909091905_init` applied and verified end-to-end through a Next route; `src/lib/prisma.ts` singleton guarded against hot-reload pool churn; `.gitignore` gained `!.env.example` (the blanket `.env*` would have swallowed it) plus `db:*` npm scripts

<!-- 8. Seed — system item types (no spec file; types from project-overview.md) -->

8. Seed system item types — `prisma/seed.ts` seeds the 7 system types (`userId = null`, `isSystem = true`) with the icons/colours from @context/project-overview.md, mirroring the `--color-type-*` tokens in `globals.css`; idempotent by matching on `name` + `userId: null` rather than `upsert`, since the declarative `@@unique([userId, name])` cannot identify a system row (Postgres treats NULLs as distinct, so it permits two `(NULL, 'snippet')` rows); migration `20260909103127_system_item_type_unique_index` adds a hand-written partial unique index on `(name) WHERE "userId" IS NULL` to enforce this in the database, verified to survive a later `migrate dev` without Prisma trying to drop it; seed registered under `migrations.seed` in `prisma.config.ts` because Prisma 7 dropped automatic seeding, exposed as `npm run db:seed`; `scripts/test-db.ts` extended with a System item types section asserting the 7 rows and that the partial index rejects a duplicate; the type list itself extracted to `src/lib/system-item-types.ts` as a side-effect-free single source of truth that both the seed and the test import, so the two cannot drift (the seed could not be imported directly — it calls `main()` at module scope, so importing it would run the seed); the test now compares exact icons and colours rather than only hex format, points its fixture item at a seeded system type (the path the app will take) while a separate user-owned type exercises the cascade, and asserts system types survive a user deletion; drift detection verified by temporarily adding an 8th type and confirming the run fails with exit code 1

<!-- 9. Seed — demo data (seed-spec.md) -->

9. Seed demo data (@context/features/seed-spec.md) — `prisma/seed.ts` rewritten into two parts: system item types (every environment) and demo data (a demo user, 5 collections, 18 items), with the sample content itself in `prisma/demo-data.ts` as pure data referencing types by name rather than id; `bcryptjs@3.0.3` added for the demo password at 12 rounds (it ships its own types, so no `@types/bcryptjs`); demo data gated on `NODE_ENV !== "production"` because the password is published in the spec, while system types still seed everywhere since the app cannot create an item without one; idempotency handled by deleting the demo user first and letting the cascade clear their graph — collections and items have no unique key, so a second run would otherwise duplicate all 23 rows; verified by running the seed twice (counts steady at 1 user / 5 collections / 18 items / 18 joins / 7 types), by running it with `NODE_ENV=production` and confirming demo data is untouched, and by checking the bcrypt hash validates the password and rejects a wrong one; `scripts/test-db.ts` gained a Demo data section asserting the profile, hash format, per-collection item counts, that every item sits in a collection and uses a system type, and that `contentType` agrees with the payload (URL items carry a url and no content, TEXT items the reverse); all 6 demo links confirmed to return HTTP 200

<!-- 10. Dashboard collections — real data (dashboard-collections-spec.md) -->

10. Dashboard collections from the database (@context/features/dashboard-collections-spec.md) — the dashboard's collection grid and collection stats now read from Neon instead of `src/lib/mock-data.ts`, with the design unchanged; new `src/lib/db/collections.ts` exposes `getRecentCollections(userId, limit)` and `getCollectionStats(userId)`, the former pulling each collection's types in a single query that joins through `ItemCollection` -> `Item` -> `ItemType` (no N+1) and ranking them by item count so the first entry drives the card's left border, with ties broken by the canonical order in `system-item-types.ts` so the icon row cannot reshuffle between renders; `CollectionCard` switched from mock type ids to type *names* because database ids are cuids with no relation to the mock fixtures, which also let `item-types.ts` take `ItemTypeName` from `system-item-types.ts` (the seed's source of truth) rather than from mock data, and gained `TYPE_LABELS` for the icon `aria-label`s that previously came off the mock rows; `isSystemItemTypeName` added as a guard for names read from the database, since custom types are a later Pro feature with no colour/icon mapping; a new `src/lib/db/user.ts` resolves the seeded demo user as `getCurrentUser()` — collections must be scoped to a user and NextAuth is not wired up yet, so only that file changes when auth lands; `/dashboard` is now an async server component (Next marks it dynamic) with an empty state when the user has no collections; item counts, pinned and recent items deliberately still come from mock data, per the spec's "do not add the items underneath yet"; verified in the browser against the seeded demo user (5 collections, correct per-collection counts, favourites starred, border colours matching the dominant type) with `npm run build` and `npm run lint` clean; `.playwright-mcp/` added to `.gitignore`

<!-- 11. Dashboard items — real data (dashboard-items-spec.md) -->

11. Dashboard items from the database (@context/features/dashboard-items-spec.md) — the Pinned and Recent lists, and the last two stats counters, now read from Neon, finishing the move off `src/lib/mock-data.ts` for the dashboard; new `src/lib/db/items.ts` exposes `getPinnedItems(userId)`, `getRecentItems(userId, limit)` and `getItemStats(userId)`, sharing one `ITEM_SELECT` so the two list queries cannot drift, and flattening each row into an `ItemSummary` whose `typeName` is `null` for a custom type rather than throwing (custom types are a later Pro feature with no colour/icon mapping); `ItemRow` switched from mock ids to type names like `CollectionCard` before it, with a neutral `Box` fallback for a typeless row, and now hides the description and tag rows when those are empty; `/dashboard` runs all five queries in one `Promise.all`, renders the Pinned section only when something is pinned, and gained an empty state for Recent; `formatShortDate` widened to accept a `Date`, since Prisma returns one where the mock data held ISO strings; the seed had never created any tags, so the badge row — part of the reference design — would have vanished once items came from the database: `prisma/demo-data.ts` gained a `tags` field on all 18 items and `prisma/seed.ts` creates the 26 `Tag` rows up front and joins items to them, one row per name per user (`@@unique([userId, name])`) rather than one per application; `scripts/test-db.ts` gained three assertions — the tag count matches the distinct names in the demo data, every item is tagged, and each item's tags match its fixture — and the whole suite still passes, as does a second seed run with steady counts; verified in the browser (type-coloured borders and icon tiles, pin/star markers, tag badges, dates) with `npm run build` and `npm run lint` clean; the empty-pinned path was not exercised in the browser — a blanket `updateMany` to unpin every item was blocked by the permission classifier and left alone — so that guard rests on the `pinnedItems.length > 0` conditional alone

<!-- 12. Stats & sidebar — real data (stats-sidebar-spec.md) -->

12. Stats and sidebar from the database (@context/features/stats-sidebar-spec.md) — the sidebar now reads from Neon, which removes the last `src/lib/mock-data.ts` import in `src/`; the stats cards needed no work, since step 11 had already moved all four counters onto the database, so the spec's first requirement was verified rather than implemented; `DashboardSidebar` became an async server component resolving `getCurrentUser()` itself rather than taking props, because `DashboardShell` renders it for `/dashboard`, `/items` and now `/collections` and would otherwise have to thread the data through every layout; `NavTypes` no longer takes a list of types at all — the seven system types are a fixed set, so it maps `SYSTEM_ITEM_TYPE_NAMES` and takes only an `ItemTypeCounts` record, which keeps a type with zero items visible instead of silently dropping it; that record comes from a new `getItemTypeCounts(userId)` in `src/lib/db/items.ts`, one `groupBy` plus one `itemType` lookup rather than seven counts, seeded to zero for every system type so the sidebar always renders the full list; `src/lib/db/collections.ts` gained a private `findCollections(where, limit)` holding the shared select and the `rankTypes` mapping, with `getRecentCollections`, the new `getAllCollections` and the new `getSidebarCollections(userId, recentLimit)` on top — the last returning favourites and non-favourites separately so a favourite cannot appear in both sidebar lists; `NavCollections` keeps the star on favourites and gives each recent row a `DominantTypeDot`, a circle taking `TYPE_DOT_CLASSES[typeNames[0]]`, so it reuses the same ranking that already drives the collection card's left border rather than recomputing a dominant type, and falls back to a muted ring for an empty collection; the dot sits inside a `size-4` box so the labels line up with the icon-led favourites above it; "View all collections" links to a new `/collections` route (page + layout reusing `DashboardShell` and `CollectionCard`), added because the spec's link would otherwise 404; `/items/[type]` moved off the mock `itemTypes` lookup onto a new `itemTypeFromSlug` in `lib/item-types.ts` — the reverse of `itemTypeSlug`, rejecting a slug like `note` that is not the exact plural — with its count coming from `getItemTypeCounts`, so the sidebar's type links now resolve against real data; `getItemType(id)` deleted as the last mock consumer in `lib/item-types.ts`, and `SidebarUser` retyped from the mock `User` to `CurrentUser`, whose `name`/`email` are nullable, falling back name -> email -> "Signed out"; verified in the browser (type counts 4/3/5/0/0/0/6 summing to the 18-item stat, both favourites starred, the three recent dots matching their cards' border colours, the active state on "View all collections", `/items/notes` reading 0 items and `/items/bogus` returning 404) with a clean console and `npm run build` and `npm run lint` passing; `src/lib/mock-data.ts` deleted — with the sidebar moved over nothing imported it any more, and the build and lint stay clean without it
