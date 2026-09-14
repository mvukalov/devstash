---
name: list-components
description: List the React component files under src/components, optionally limited to one subdirectory (e.g. dashboard, ui). Use when asked what components exist, to inventory the components folder, or to find a component by name.
---

## Task

List all React component files (.tsx, .ts, .jsx, .js) under `src/components`.

Optional argument: a subdirectory name. `$ARGUMENTS` — if non-empty, only list files inside `src/components/$ARGUMENTS`.

## Output Format

- Numbered list of files with relative paths
- Brief one-line description of each (infer from filename)
- Summary count at the end

If no files found, say "No components found."
