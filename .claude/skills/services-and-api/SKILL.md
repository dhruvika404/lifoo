---
name: services-and-api
description: The axios client, auth-token/refresh flow, backend response envelope, and service-module conventions. Load before adding or modifying anything in services/, or any code that talks to the backend.
---

# Services & API pattern

All HTTP goes through `services/`. Components and stores call service objects; **`apiClient`/`axios` never appears in a component**.

## The shared client — `services/api.ts`

```ts
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Tunnel-Skip-AntiPhishing-Page": "true",   // dev runs behind localtunnel/ngrok
    "ngrok-skip-browser-warning": "true",
  },
});
```

- **Request interceptor**: attaches `Authorization: Bearer <access_token>` from the `access_token` cookie (`getToken` in `utils/auth.ts`), skipping public routes (`/auth/login`, `/auth/token/refresh`).
- **Response interceptor**: on 401 (non-login), performs a single-flight refresh — module-level `isRefreshing` + `refreshQueue` of pending requests — via `POST ${API_URL}/api/v1/auth/token/refresh` with `{ refreshToken }`. Success: `setToken`/`setTokenExpiry`, `window.dispatchEvent(new Event("updateStorage"))`, replay queue, retry original (`originalRequest._retry` guards loops). Failure: `toast.error("Session expired, please login again")`, `removeAll()`, redirect `/login` (unless already there).

Do not create a second axios instance; extend this one only inside `services/api.ts`.

## Token storage — `utils/auth.ts` (js-cookie)

Cookies `access_token`, `refresh_token`, `access_token_expiry` (`path: "/"`, `sameSite: "strict"`, `secure` on https). `checkToken()` proactively refreshes within 2 minutes of expiry; it is driven by `store/authStore.ts` (60s interval + tab-focus listener). `removeAll()` clears cookies + `localStorage.user` and broadcasts `updateStorage`. `utils/refreshTracker.ts` is a localStorage debug log for refresh races (`dumpRefreshLog()`, `findRaces()` in the console).

## Response envelope (backend `ok()`/`err()` shape)

Every backend response is `{ ok: boolean, data: T }`. Services return the whole envelope; callers check `ok` then unwrap `data`:

```ts
export interface GetRolesResponse {
  ok: boolean;
  data: { items: RoleItem[]; nextCursor?: string | null };
}
```

List endpoints are **cursor-paginated** (`items` + `nextCursor`), though some legacy responses may be a bare array — existing callers defensively handle `Array.isArray(res.data) ? res.data : res.data.items`.

## Service module shape — copy `services/admin.service.ts`

```ts
import { apiClient } from "./api";

export const adminService = {
  getAdmins: async (search?: string): Promise<GetAdminsResponse> => {
    const url = search ? `/admin/v1/users?search=${encodeURIComponent(search)}` : "/admin/v1/users";
    const { data } = await apiClient.get<GetAdminsResponse>(url);
    return data;
  },
  addAdmin: async (adminData: {...}): Promise<AddAdminResponse> => {
    const { data } = await apiClient.post<AddAdminResponse>("/admin/v1/users", adminData);
    return data;
  },
  // put /admin/v1/users/:id/access, /reset-password, /:id/enable|disable ...
};
```

One object literal per domain, typed request payloads inline, typed response interfaces above. Barrel: `services/index.ts` re-exports `apiClient`, `authService`, `adminService`, `categoryService` — add new services there. **`services/categoryService.ts` is a stale duplicate of `category.service.ts` (the barrel imports the dotted file); never extend the camelCase twin, and never create new twins.**

## Real endpoint map (verified)

- Auth: `/api/v1/auth/login|logout|token/refresh|password/forgot/otp|password/forgot/reset|otp/request|password/reset` (`services/auth.service.ts`).
- Admin users/roles: `/admin/v1/users`, `/admin/v1/roles`, `/admin/v1/users/:id/access|reset-password|enable|disable` (`services/admin.service.ts`).
- Categories: `/admin/v1/categories` (+ `/:id`, `/upload-url?mimeType=`, `/:id/enable|disable`, `/bulk-upload`, reorder) (`services/category.service.ts`).

Backend is the sibling `lifoo-backend` (Fastify). Money = **integer paisa**, IDs = **ULID** (backend-generated — e.g. `getUploadUrl` returns the new `categoryId`), time = **UTC ISO** (display Asia/Kolkata). Convert paisa → rupees at render (`paisa / 100`, `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`); no shared formatter exists yet, so add one in `utils/` rather than a third inline copy.

## Error handling + toast contract

Services throw raw axios errors. Callers (stores/components) extract and toast:

```ts
const errMsg = err?.response?.data?.message || err?.message || "Failed to <verb> <noun>";
toast.error(errMsg);
```

`store/authStore.ts` has the fuller `getErrorMessage` (handles `message | error | errorMessage`, string arrays, nested objects) — reuse it for auth-adjacent flows. Success paths toast too: `toast.success(...)`. `<Toaster position="top-right">` is mounted once in `app/layout.tsx`; never mount another.

## Uploads (MinIO/S3)

Flow (see `app/(dashboard)/categories/new-category-dialog.tsx`): `categoryService.getUploadUrl(file.type)` → `{ categoryId, presignedUrl, s3Key }` → browser `minioClient.send(new PutObjectCommand({ Bucket: NEXT_PUBLIC_MINIO_BUCKET, Key: s3Key, Body, ContentType }))` (`lib/minio-client.ts`, `forcePathStyle: true`) → persist `s3Key` as `imageUrl`. Display URLs are `${NEXT_PUBLIC_MINIO_ENDPOINT}/${bucket}/${key}`. **Caution**: this puts MinIO credentials in `NEXT_PUBLIC_*` env (browser-visible) even though a presigned URL is fetched; prefer PUTting to `presignedUrl` for new upload flows, and never add new `NEXT_PUBLIC_*` secrets (the check-no-secrets hook blocks literals).
