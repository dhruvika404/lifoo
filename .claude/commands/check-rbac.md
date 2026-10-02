---
description: Sweep changed files for admin mutations not gated by a CASL ability check
argument-hint: [base-ref] (optional git ref to diff against; defaults to working tree)
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(git status:*)
---

# /check-rbac

Fast pre-review sweep for ungated mutations in the diff. For a deep audit use the `rbac-auditor` agent; this command is the cheap gate.

## Steps

1. **Scope**: `git diff --name-only $1` (working tree if `$1` empty). Keep `*.tsx`/`*.ts` under `app/` and `components/`.
2. **Find mutation triggers** in each file: calls to mutating service/store methods — `addAdmin`, `editAdmin`, `updateRole`, `addRole`, `resetPassword`, `toggleAdminStatus`, `createCategory`, `updateCategory`, `deleteCategory`, `toggleCategoryStatus`, `bulkUploadCategories`, `reorderCategories` — plus any service method wrapping `apiClient.post|put|patch|delete`.
3. **Check gating**: the button/menu/dialog reaching that call must be rendered or disabled behind an `ability.can(<action>, <subject>)` boolean derived from `defineAbilityFor` in `lib/ability.ts` (house pattern: `const canCreate = ability.can("create", "Admin")` — see `app/(dashboard)/admins/admins-client.tsx`). `@casl/react`'s `<Can>` is not used in this repo; do not require it.
4. **Check the model**: if a mutation has no matching term in the `Actions`/`Subjects` unions of `lib/ability.ts`, report a model gap (known baseline gap: category mutations have no `Category` subject yet).
5. **Flag privileged fallbacks**: any new `|| "Super Admin"`-style role default resolves unknown roles to `manage all` — report it.

## Output

Per finding: `file:line — trigger — service method — missing gate / model gap / risky fallback`. End with `RBAC SWEEP: CLEAN` or `RBAC SWEEP: N FINDINGS`. Read-only: change nothing.
