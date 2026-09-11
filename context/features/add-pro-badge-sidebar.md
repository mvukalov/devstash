# Add Pro Badge to Sidebar Spec

## Overview

Show the current user's plan in the sidebar account footer, so it is obvious at a glance whether the account is on Free or Pro.

`User.isPro` already exists on the model and is already selected by `getCurrentUser()`, so this is presentation only — no schema change, no migration, no new database query.

## Requirements

- Render a small plan badge in the sidebar user footer (@src/components/dashboard/sidebar-user.tsx), next to the account name
- Badge reads "Pro" when `user.isPro` is true, "Free" when it is false
- Style the Pro state as an accent/highlight badge and the Free state as a muted/neutral one, using the shadcn `badge` component (install it with the shadcn CLI if it is not present) — no inline styles
- Hide the badge entirely when there is no user (the "Signed out" fallback)
- Keep the name/email lines truncating correctly at narrow widths — the badge must not push the email out or wrap the row
- No upgrade flow, no link, no click target: the badge is display only, matching the Settings button pattern already in that footer

## Notes

- The seeded demo user is `isPro: false` (@prisma/demo-data.ts), so the Free state is what shows by default; verify the Pro state by flipping that one row in the database (or the demo fixture) and reverting after
- Billing gating is not part of this feature — `canAccess(feature, user)` per @context/project-overview.md remains a later milestone

## References

- @src/components/dashboard/sidebar-user.tsx
- @src/lib/db/user.ts
- @context/project-overview.md (section 7, Monetization)
