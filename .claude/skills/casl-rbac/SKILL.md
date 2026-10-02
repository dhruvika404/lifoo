---
name: casl-rbac
description: CASL ability definitions and gating patterns for the LiFoo admin dashboard. Load before adding roles, permissions, or any UI action that mutates data.
---

# CASL RBAC pattern

Client-side CASL is UX gating (hide/disable controls the role cannot use). The Fastify backend enforces authorization for real — never treat a client check as security.

## Ability definition — `lib/ability.ts` (single source of truth)

```ts
import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";

export type Actions = "create" | "read" | "update" | "reset-password" | "toggle-status" | "manage";
export type Subjects = "Admin" | "all";
export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFor(role: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  const norm = (role || "").toLowerCase().replace(/[-_\s]/g, "");
  if (norm === "superadmin") {
    can("manage", "all");
  } else if (norm === "operationsadmin" || norm === "operations") {
    can("read", "Admin"); can("update", "Admin");
    cannot("create", "Admin"); cannot("reset-password", "Admin"); cannot("toggle-status", "Admin");
  } else if (norm === "financeadmin" || norm === "finance") { /* read-only Admin */ }
  else { /* Content Moderator / Support Executive: read-only Admin */ }
  return build();
}
```

Role strings are normalized (`"Super Admin"`, `super_admin`, `super-admin` all match). Custom domain actions like `"reset-password"` and `"toggle-status"` are first-class members of the `Actions` union — extend the union AND every role branch when adding one; TypeScript will not catch a branch you forgot.

## Consumption — memoized ability + boolean flags

From `app/(dashboard)/admins/admins-client.tsx`:

```tsx
import { defineAbilityFor } from "@/lib/ability";

const activeRole = user?.roles?.[0] || currentUserRole || "Super Admin";
const ability = useMemo(() => defineAbilityFor(activeRole), [activeRole]);

const canCreate = ability.can("create", "Admin");
const canUpdate = ability.can("update", "Admin");
const canReset = ability.can("reset-password", "Admin");
const canToggleStatus = ability.can("toggle-status", "Admin");
```

Flags conditionally render/disable buttons, menu items, and dialog openers. **`@casl/react` is a dependency but `<Can>` is used nowhere** — follow the `ability.can()` flag pattern for consistency unless the team decides to migrate.

**Caution — privileged fallback**: `|| currentUserRole || "Super Admin"` plus `adminStore.currentUserRole` defaulting to `"Super Admin"` means a missing role resolves to `manage all`. Do not replicate this in new screens; fall back to the read-only branch (any unknown string already lands there in `defineAbilityFor` — the danger is only the literal `"Super Admin"` default).

## Role plumbing

- Login (`store/authStore.ts`) persists `user` incl. `roles: string[]` and a `permissions` record (`{ create, read, update, delete }` per module) from the backend.
- `components/auth-guard.tsx` (wrapping everything via `app/(dashboard)/layout.tsx`) verifies hydration → `isAuthenticated` → `checkAuth()`, redirects to `/login`, then seeds `useAdminStore.setCurrentUserRole(user.roles[0])`.
- **There is no role-based route guard** — AuthGuard is authentication only. Role enforcement in the UI is per-component gating plus `components/sidebar.tsx` filtering nav items by role.
- `components/permissions-matrix.tsx` renders the per-module CRUD matrix used in the add/edit admin dialog; role→matrix mapping lives in `add-edit-admin-dialog.tsx` (`MODULES` from `app/(dashboard)/admins/constants.ts`).

## Known model gap

`Subjects` only contains `"Admin"`; category screens (`app/(dashboard)/categories/`) already ship create/update/delete/toggle/reorder mutations with **no CASL gating**. When touching those screens, prefer adding a `"Category"` subject + role branches over widening the fallback.

## Checklist for a new gated action

- [ ] Action added to `Actions` union (and subject to `Subjects` if new).
- [ ] Every role branch in `defineAbilityFor` explicitly `can`/`cannot`s it.
- [ ] UI trigger gated by `ability.can(...)` flag; memoized with `useMemo` on the role.
- [ ] Sidebar entry role lists updated if the screen is new.
- [ ] Run `/check-rbac`, or the `rbac-auditor` agent for a full audit.
