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
