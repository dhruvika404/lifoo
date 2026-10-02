---
description: Scaffold a services/<name>.service.ts axios module matching the existing apiClient + envelope pattern
argument-hint: <name> (singular kebab-case, e.g. chef, order)
allowed-tools: Read, Glob, Grep, Write, Edit
---

# /api-service

Create `services/$1.service.ts` following the house pattern. Read `.claude/skills/services-and-api/SKILL.md` and `services/admin.service.ts` first — copy those shapes.

## Rules (verified in this repo)

- Import the shared client: `import { apiClient } from "./api";` — never `axios.create` a second instance; `services/api.ts` owns baseURL (`NEXT_PUBLIC_API_URL`), auth header injection, and the 401 refresh-queue interceptor.
- Every response is the backend envelope `{ ok: boolean; data: T }`. Declare typed interfaces for each response (see `GetAdminsResponse`, `GetRolesResponse`).
- Export one object literal, `export const $1Service = { ... }`, each method `async`, returning `data` (the envelope), e.g.:

```ts
getX: async (search?: string): Promise<GetXResponse> => {
  const url = search ? `/admin/v1/xs?search=${encodeURIComponent(search)}` : "/admin/v1/xs";
  const { data } = await apiClient.get<GetXResponse>(url);
  return data;
},
```

- Paths: admin resources live under `/admin/v1/...`; auth flows under `/api/v1/auth/...`. Confirm the exact endpoint against the backend (lifoo-backend, Fastify) or with the user — never invent routes.
- Money fields in payloads/responses are integer paisa; IDs are backend-generated ULIDs; timestamps UTC ISO. Type them as `number`/`string` and note the unit in the interface (e.g. `pricePaisa`).
- No toasts, no store imports, no React in a service. Error handling and toasts belong to callers (stores/components).
- Re-export from the barrel: add `export { $1Service } from "./$1.service";` to `services/index.ts`. File naming is `<name>.service.ts` — do not create a camelCase twin (`categoryService.ts` is a stale duplicate; `services/index.ts` re-exports from `category.service.ts`).

Then summarize the new methods and stop — wiring into stores/screens is `/add-crud-screen` or the caller's job.
