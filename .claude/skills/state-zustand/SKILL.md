---
name: state-zustand
description: Real zustand 5 store shapes in store/ — auth persistence, list stores with cursor pagination, and when to use store vs local vs URL state. Load before adding or modifying stores.
---

# Zustand state pattern

Stores live in `store/` — one per domain: `authStore.ts`, `adminStore.ts`, `categoryStore.ts`. **`lib/store.ts` is a legacy duplicate of the admin store (also exports `useAdminStore`) — never import or extend it.** `lib/mock-data.ts` still seeds `adminStore.admins` and the dashboard mock; treat it as placeholder data, not a pattern.

## authStore — the only persisted store

```ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({ /* tokens, user, isAuthenticated, isLoading, error, hasHydrated, actions */ }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // accessToken NOT persisted — silently refreshed on every page load
      }),
      onRehydrateStorage: () => (state) => {
        const token = getToken("access_token");     // cookie, not localStorage
        if (token) state.accessToken = token;
        state?.setHasHydrated(true);
      },
    }
  )
);
```

Key facts:

- **`accessToken` must never enter `partialize`** — it lives in the `access_token` cookie; the store copy is rehydrated from the cookie.
- `hasHydrated` gates everything auth-dependent; `components/auth-guard.tsx` waits for it before verifying (`if (!hasHydrated) return;`).
- Actions own their service calls (`authService.login/refresh/...`), set `isLoading`/`error`, normalize `user.roles` (objects → `r.name || r.id` strings), and re-throw a `new Error(message)` so forms can react.
- Module-scope side effects (guarded by `typeof window !== "undefined"`): `setInterval(() => checkAuth(), 60_000)` + `window.addEventListener("focus", checkAuth)` keep the session fresh. Do not add a second interval elsewhere.

## List stores — copy `store/categoryStore.ts` for new resources

Plain `create<CategoryState>((set, get) => ...)` — no persist. Shape:

- Data: `categories`, `isLoading`, `error`.
- **Cursor pagination**: `limit`, `currentPageCursor`, `nextCursor`, `history: (string | null)[]` (stack of previous cursors); `goToNextPage` pushes, `goToPreviousPage` pops; `setLimit`/`setFilters`/`resetFilters` clear cursors and refetch.
- **Filters live in the store** (`search`, `parentId`, `complianceRegime`, `active`, `fromDate`, `toDate`), each setter triggering `await get().fetchCategories()`.
- Mutations (`deleteCategory`, `toggleCategoryActive`, `reorderCategories`) call the service, then refetch or patch state.

`store/adminStore.ts` is the flatter variant: `admins` + `roles` with separate `isLoading`/`isRolesLoading` and `error`/`rolesError`, `fetchAdmins(search?)`/`fetchRoles(search?)`, async CRUD actions delegating to `adminService`, plus `currentUserRole` (seeded by AuthGuard from `user.roles[0]`; defaults to `"Super Admin"` — a known-risky fallback, see casl-rbac skill).

Action error pattern (uniform across stores):

```ts
} catch (err: any) {
  const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch roles";
  set({ rolesError: errMsg });
}
```

Envelope check before consuming: `if (response && response.ok && response.data) { ... }`, tolerating both `data.items` and bare-array `data`.

## Store vs local vs URL state (as practiced here)

- **Zustand store**: server-derived collections + their fetch status, list filters/pagination that outlive a dialog, cross-component session state (auth, current role). One store per domain; no "global misc" store.
- **Local `useState`**: dialog open/close, dropdown open, file-upload progress, password visibility — anything born and dying inside one component. Form *values* are never `useState` — they belong to react-hook-form (`.agents/AGENTS.md`).
- **URL state**: currently only route params (`app/(dashboard)/categories/[slug]/page.tsx`). Filters are store-held, so they reset on navigation — if a screen needs shareable/refresh-proof filters, promote them to `searchParams` deliberately; do not half-sync store and URL.

## Rules for a new store

- [ ] File `store/<domain>Store.ts`, hook `use<Domain>Store`, plain `create` (persist is auth-only).
- [ ] Calls services only (`@/services`); never `apiClient` directly; no toasts inside getters — mutating actions may toast or let the caller do it, but pick one per action and stay consistent with the neighbors.
- [ ] Check `response.ok`; extract errors with the standard chain; keep `isLoading` truthful in `finally`-equivalent paths.
- [ ] Cursor pagination + store-held filters for list screens (match categoryStore).
- [ ] No module-scope timers except the existing authStore pair.
