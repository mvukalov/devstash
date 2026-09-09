# Current Feature

<!-- Feature Name -->

Database — Neon PostgreSQL + Prisma 7 (@context/features/database-spec.md)

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

- Provision a Neon (serverless PostgreSQL) project with a **development** branch (`DATABASE_URL`) and a separate **production** branch.
- Install and configure Prisma 7 — review the [upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) first, since it has breaking changes vs. Prisma 6.
- Create the initial `schema.prisma` from the data model in @context/project-overview.md:
  - Auth models for NextAuth v5: `User`, `Account`, `Session`, `VerificationToken`
  - Core domain: `ItemType`, `Item`, `Collection`, `Tag`
  - Explicit join tables: `ItemCollection` (with `addedAt`), `ItemTag`
  - `ContentType` enum (`TEXT | URL | FILE`)
  - Billing fields on `User` (`isPro`, `stripeCustomerId`, `stripeSubscriptionId`, `proSince`)
- Add appropriate indexes (`userId`, `itemTypeId`, `[userId, isPinned]`, `[userId, isFavorite]`, join-table FKs) and `onDelete: Cascade` on user-owned relations.
- Add a singleton Prisma client at `src/lib/prisma.ts` (guarded against hot-reload duplication in dev).
- Generate the first migration with `prisma migrate dev` and commit it.
- Verify with `prisma migrate status` and `npm run build`.

## Notes

<!-- Any extra notes -->

- **Migrations only.** Never `prisma db push` and never hand-edit the DB — `prisma migrate dev` locally (committed), `prisma migrate deploy` in production.
- Prisma 7 moves fast; fetch current docs before scaffolding rather than relying on memory ([quickstart](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres)).
- The schema is a starting point and will evolve — no seed data or app wiring in this feature beyond the client singleton.
- `.env` holds `DATABASE_URL` (dev branch) and stays out of git; document the required vars in `.env.example`.

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial Next.js 16.3.4 setup — App Router (`src/app`), React 19.2.8, TypeScript, Tailwind CSS v4 (PostCSS), ESLint 9 flat config
- Mock data for the dashboard UI (`src/lib/mock-data.ts`)
- Dashboard UI Phase 1 (@context/features/dashboard-phase-1-spec.md) — shadcn/ui init (radix base, nova preset, neutral, CSS variables), UI components installed, `/dashboard` route with sidebar + top bar shell, dark mode by default, display-only search and New Collection / New Item buttons, `h2` placeholders for sidebar and main
- Dashboard UI Phase 2 (@context/features/dashboard-phase-2-spec.md) — shadcn `sidebar`/`collapsible` installed, sidebar with collapsible Types (linking to `/items/[type]`) and Collections (favorites + recent) groups, user footer, top-bar toggle, offcanvas on desktop and Sheet drawer on mobile, open state persisted in the `sidebar_state` cookie; type accent colours added to `globals.css` as `--color-type-*`; `DashboardShell` shared by `/dashboard` and `/items`; `useIsMobile` rewritten with `useSyncExternalStore` to satisfy the `set-state-in-effect` lint rule
- Dashboard UI Phase 3 (@context/features/dashboard-phase-3-spec.md) — dashboard main area: 4 stats cards (items, collections, favorite items, favorite collections), recent collections grid with type-coloured left borders and type icon row, pinned items list, 10 most recent items; new `CollectionCard` / `ItemRow` / `StatsCards` components, `getItemType` + border/tile colour maps in `lib/item-types.ts`, and `formatShortDate` in `lib/format.ts` (fixed locale/UTC to avoid hydration drift)
- Database — Neon PostgreSQL + Prisma 7 (@context/features/database-spec.md) — Prisma pinned to exact `7.10.0` (npm's `latest` tag currently points at the `8.0.0-rc.13` release candidate, and prisma.io docs have already moved to v8, so v7 docs live under `/docs/orm/v7/`); new Rust-free `prisma-client` generator outputting to `src/generated/prisma` (gitignored, rebuilt by a `postinstall` script), `@prisma/adapter-pg` driver adapter (required in v7 — `new PrismaClient()` without one throws), `prisma.config.ts` owning the datasource URL with an explicit `dotenv/config` import since the v7 CLI no longer loads `.env`; two Neon connection strings — pooled `DATABASE_URL` for the app, direct `DIRECT_URL` for the CLI (PgBouncer transaction mode breaks the advisory locks migrations need); `prisma.config.ts` reads `process.env.DIRECT_URL` rather than the `env()` helper, which resolves eagerly and would break credential-free `prisma generate` in CI/Vercel; full schema (10 models + `ContentType` enum, NextAuth models, explicit `ItemCollection`/`ItemTag` join tables), FK indexes and cascade deletes, initial migration `20260909091905_init` applied and verified end-to-end through a Next route; `src/lib/prisma.ts` singleton guarded against hot-reload pool churn; `.gitignore` gained `!.env.example` (the blanket `.env*` would have swallowed it) plus `db:*` npm scripts
