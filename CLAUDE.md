## Devstah

a developer knowledge hub for snippets,comands, prompts, notes, files, images , links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev     # dev server (Turbopack) on :3000
npm run build   # production build; also runs the TypeScript check
npm run lint    # eslint (flat config; note: bare `eslint`, not `next lint`)
npm start       # serve the production build
```

Type errors surface through `npm run build` — `tsconfig.json` is `noEmit`, and there is no standalone typecheck script. No test framework is installed; there are no tests to run.

## Repository layout

This project is its own git repository, rooted at this directory, with remote `https://github.com/mvukalov/devstash.git`.

The parent directory `/Users/martinvukalovic/Documents/ALL_PROJECT_CODE` is a **separate, unrelated** repository (`REACT_CODE`) holding many sibling projects. Never run git commands from there when working on DevStash — always stay in this directory.

## Neon MCP

Whenever you use the Neon MCP server (configured in `.mcp.json`), these defaults apply without asking:

- **Project:** the DevStash Neon project — the one whose endpoint is `ep-autumn-recipe-ax7j2c5i` (`c-4.us-east-2.aws`), matching `DATABASE_URL` in `.env`. Never operate on any other Neon project in my account, even if a tool lists it.
- **Branch:** `main`. Do not read from or write to any other Neon branch unless I name it in that message.
- **Scope:** if a Neon tool takes a project or branch argument, always pass these explicitly. Never rely on the server's own default, and never call a tool that acts across all projects.
- If the project or branch cannot be resolved, stop and ask — do not guess or fall back to "the first project listed".

### Production is off limits

- The production database is the endpoint `ep-late-bonus-ax3d0401` (`c-4.us-east-2.aws`), which is what `.env.production` points at. It is **off limits** — do not read from it, write to it, or connect to it at all unless I say so in that same message.
- Treat anything outside the working branch above — and any Neon branch, database, or project I have called production — as **read-only and off limits**.
- Never run a destructive or schema-changing operation (`DROP`, `DELETE`, `TRUNCATE`, `ALTER`, migrations, branch delete/reset, role or endpoint changes) against production unless I explicitly say "production" in that same message.
- My general approval for a command in this session never carries over to production. Ask every time.
- Schema changes still follow the repo rule: `prisma migrate dev` locally, committed, then `prisma migrate deploy` in production. Never `prisma db push`, and never apply DDL to Neon by hand through the MCP.

**IMPORTANT** Do not add claude to any commit masaages"!
