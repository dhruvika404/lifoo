---
description: Scaffold a full admin CRUD screen — page + client + service + zod schema + zustand store — following the categories/admins patterns
argument-hint: <resource> (singular kebab-case, e.g. chef, order, payout)
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(npm:*), Bash(npx:*), Bash(git diff:*)
---

# /add-crud-screen

Scaffold a dashboard CRUD screen for resource `$1` by cloning the shapes that already exist for categories (list + filters + dialogs) and admins (RBAC-gated table). Read the real files first — templates live in the code, not in memory.

Next.js 16.2.9 here is newer than training data: before touching routing, layouts, or metadata, read the relevant guide in `node_modules/next/dist/docs/` (`npm install` first if missing), per `AGENTS.md`.

## Steps

1. **Load skills**: `.claude/skills/services-and-api`, `forms-shadcn-zod`, `state-zustand`, `casl-rbac`.
2. **Service** — `services/$1.service.ts` modeled on `services/category.service.ts`: `{ ok, data }` envelope interfaces, methods on an exported `$1Service` object calling `apiClient` with `/admin/v1/<plural>` paths (confirm the real path with the backend repo or the user — do not invent endpoints). Re-export from `services/index.ts`.
3. **Schema** — `schemas/$1.ts` with zod 4 (`import * as z from "zod"`) form schemas + `z.infer` types; re-export from `schemas/index.ts`.
4. **Store** — `store/$1Store.ts` modeled on `store/categoryStore.ts`: list + `isLoading` + `error`, cursor pagination (`limit`, `currentPageCursor`, `nextCursor`, `history`), filters + `setFilters`/`resetFilters`, async actions that check `response.ok` and extract errors via `err?.response?.data?.message || err?.message || fallback`. Plain `create<...>()` — `persist` is reserved for auth.
5. **Screen** — `app/(dashboard)/<plural>/`:
   - `page.tsx`: server component, exports `metadata` (`"<Title> — LiFoo Admin"`), renders `<XPageClient />` (copy `app/(dashboard)/admins/page.tsx`).
   - `$1-client.tsx`: `"use client"`, wires store + `useDebounce` search + shadcn `Table` + dialogs.
   - `new-$1-dialog.tsx` / `edit-$1-dialog.tsx` / `delete-$1-dialog.tsx` as needed — delegate the form internals to the `form-builder` agent pattern.
   - `constants.ts` for module/display-name maps if the screen needs them.
6. **RBAC** — gate every mutating control with `ability.can(...)` from `defineAbilityFor` (`lib/ability.ts`). If `$1` needs a new subject/action, extend the `Actions`/`Subjects` unions and every role branch. Then run the `rbac-auditor` agent.
7. **Nav** — add the screen to `components/sidebar.tsx` (it filters items by role — place `$1` in the correct role lists).
8. **Money/time** — any amount field from the backend is integer paisa: render `₹` via `/100` with `en-IN` formatting; dates are UTC ISO, display Asia/Kolkata.
9. **Verify** — `npx tsc --noEmit` && `npm run lint`. No test runner exists; state the manual QA path. Do not commit.

Summarize created files. Stop.
