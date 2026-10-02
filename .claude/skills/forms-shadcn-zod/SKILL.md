---
name: forms-shadcn-zod
description: The house form pattern — zod 4 schemas, react-hook-form + zodResolver, shadcn inputs, submit → service → toast. Load before building or modifying any form.
---

# Forms: react-hook-form + zod + shadcn

`.agents/AGENTS.md` is binding: always RHF + Zod via `@hookform/resolvers/zod`; no `useState` for input values or manual error objects; custom selects use `setValue("field", value, { shouldValidate: true })`.

Reference implementations: `app/(dashboard)/admins/add-edit-admin-dialog.tsx` (dialog form + searchable role dropdown + permissions matrix) and `app/(dashboard)/categories/new-category-dialog.tsx` (form + MinIO upload + submit contract). Next.js 16 App Router semantics are newer than training data — check `node_modules/next/dist/docs/` when in doubt (`npm install` if absent).

## 1. Schema — zod 4, `schemas/` for shared flows

```ts
import * as z from "zod";

export const addRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters")
    .regex(/^[a-z0-9_]+$/, "Role name must contain only lowercase letters, numbers, and underscores (e.g. customer_support)"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  permissions: z.array(z.object({ module: z.string(), create: z.boolean(), read: z.boolean(), update: z.boolean(), delete: z.boolean() }))
    .min(1, "At least one module permission must be defined"),
});
export type AddRoleFormValues = z.infer<typeof addRoleSchema>;
```

- Shared flows live in `schemas/auth.ts` / `schemas/admin.ts`, re-exported by `schemas/index.ts`. Some dialogs co-locate a screen-local schema at the top of the file (e.g. `adminFormSchema` in add-edit-admin-dialog) — acceptable for single-screen forms; anything reused goes in `schemas/`.
- Cross-field rules use `.refine` with `path` (see `forgotPasswordResetSchema` password/confirmPassword match in `schemas/auth.ts`).
- Every schema exports its `z.infer` type, suffixed `FormValues`.

## 2. Hook setup

```tsx
const {
  register, handleSubmit, setValue, setError, reset, watch,
  formState: { errors, isSubmitting },
} = useForm<AdminFormValues>({
  resolver: zodResolver(adminFormSchema),
  defaultValues: { name: "", email: "", phone: "", role: "", password: "" },
});
```

- `defaultValues` lists **every** field.
- Dialogs `reset(...)` in a `useEffect` on `open` — editing entity values or blanks (add-edit-admin-dialog lines 95–128).
- Conditional runtime rules use `setError("field", { type: "manual", message })` in the submit handler (e.g. password required only when creating).
- `watch("role")` drives dependent UI (permissions matrix recompute).

## 3. Fields — no shadcn `<Form>` primitives exist here

`components/ui/` contains button, input, dialog, select, card, sheet, badge, table — **there is no `form.tsx` / FormField / FormControl**. Do not invent them; the pattern is label + registered `Input` + inline error:

```tsx
<div className="space-y-1.5">
  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
  <Input id="name" placeholder="e.g. Anjali Verma"
    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
    {...register("name")} />
  {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
</div>
```

Custom dropdowns (searchable role picker) are plain divs + state, committing via `setValue("role", roleId, { shouldValidate: true })`; remote search debounced with `useDebounce(query, 300)` from `hooks/use-debounce.ts` + service call; close on outside-click/Escape via document listeners.

## 4. Shell & submit

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader><DialogTitle>…</DialogTitle><DialogDescription>…</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">…</form>
```

Submit → service → toast (from new-category-dialog):

```tsx
const onSubmit = async (values: CategoryFormValues) => {
  try {
    const res = await categoryService.createCategory(payload);
    const success = res?.ok ?? (res?.data !== undefined);
    if (!success) throw new Error((res as any)?.message || "Failed to create category");
    toast.success(`Category "${values.name}" created successfully.`);
    onCreated(); onOpenChange(false);
  } catch (err: any) {
    toast.error(err?.response?.data?.message || err?.message || "Failed to create category");
  }
};
```

Submit button: `disabled={isSubmitting}` with `<Loader2 className="animate-spin" />`. Service calls only via `services/` objects — never `apiClient` in the component.

## 5. Files with uploads

Get metadata first (`categoryService.getUploadUrl(file.type)` → `{ categoryId, presignedUrl, s3Key }`), upload on file-select with explicit status state (`idle | fetching-url | uploading | done | error`), and block submit until `uploadStatus === "done"` (`toast.error("Please wait for the image to finish uploading.")`). Entity ID comes from the backend response (`uploadMeta.categoryId` — a ULID); do not mint IDs client-side.

## 6. Money fields

Users type rupees; payloads carry **integer paisa** (`Math.round(rupees * 100)`); backend amounts render as `₹` via `/100` + `en-IN` formatting. Never send floats for money.

## Checklist

- [ ] Schema + `z.infer` type (in `schemas/` if shared). - [ ] `zodResolver`, full `defaultValues`, `reset` on open.
- [ ] Registered `Input`s + destructive-styled inline errors. - [ ] Custom selects via `setValue(..., { shouldValidate: true })`.
- [ ] `isSubmitting` guard. - [ ] Submit → service → `toast.success` / extracted `toast.error`.
- [ ] Mutation opener gated by `ability.can(...)` (see casl-rbac skill). - [ ] `npx tsc --noEmit` passes.
