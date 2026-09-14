# Add Pro Badge to Sidebar

> Source: `.claude/skills/feature/add-pro-padge-sidebar.md` (filename has a typo, hence it
> was not found under `context/features/` when the feature was first loaded).

## Overview

Add a pro badge to the files and the images type in the sidebar.

## Requirements

- Use ShadCN UI badge component
- Make badge clean and subtle
- Make Pro all uppercase

## Notes

- `file` and `image` are the Pro-only system types per @context/project-overview.md (section 7, Monetization)
- Display only — the badge marks the type as Pro-gated; it does not enforce anything, and `canAccess(feature, user)` remains a later milestone
- The earlier misread of this spec put a Free/Pro plan badge in the sidebar account footer instead; that badge is removed as part of this feature
