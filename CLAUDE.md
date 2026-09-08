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

The git repository root is `/Users/martinvukalovic/Documents/ALL_PROJECT_CODE`, one level **above** this project. `git status` and `git log` therefore report on many unrelated sibling projects, and paths in git output are prefixed with `devstash/`. Scope git commands to this directory (`git status -- .`) unless you intend otherwise.
