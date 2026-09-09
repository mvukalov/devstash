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

- Project setup and boilerplate cleanup
- Initial Next.js 16.3.4 setup — App Router (`src/app`), React 19.2.8, TypeScript, Tailwind CSS v4 (PostCSS), ESLint 9 flat config
- Mock data for the dashboard UI (`src/lib/mock-data.ts`)
- Dashboard UI Phase 1 (@context/features/dashboard-phase-1-spec.md) — shadcn/ui init (radix base, nova preset, neutral, CSS variables), UI components installed, `/dashboard` route with sidebar + top bar shell, dark mode by default, display-only search and New Collection / New Item buttons, `h2` placeholders for sidebar and main
- Dashboard UI Phase 2 (@context/features/dashboard-phase-2-spec.md) — shadcn `sidebar`/`collapsible` installed, sidebar with collapsible Types (linking to `/items/[type]`) and Collections (favorites + recent) groups, user footer, top-bar toggle, offcanvas on desktop and Sheet drawer on mobile, open state persisted in the `sidebar_state` cookie; type accent colours added to `globals.css` as `--color-type-*`; `DashboardShell` shared by `/dashboard` and `/items`; `useIsMobile` rewritten with `useSyncExternalStore` to satisfy the `set-state-in-effect` lint rule
