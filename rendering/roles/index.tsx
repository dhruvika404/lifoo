"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, ShieldCheck, Plus, Loader2, ShieldAlert, Users, Edit2, Eye, Shield, Lock, Check, X } from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader, PageBody, DataTable } from "@/components/pageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { defineAbilityFor } from "@/lib/ability";
import type { RoleItem } from "@/services/admin.service";

import { MODULES, getRoleDisplayName } from "@/rendering/admins/constants";
import { addRoleSchema, AddRoleFormValues } from "@/schemas";
import { PermissionsMatrix } from "@/components/permissionsMatrix";

export function RolesModule() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roles, fetchRoles, addRole, updateRole, isRolesLoading, rolesError, currentUserRole } = useAdminStore();

  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewingRolePermissions, setViewingRolePermissions] = useState<RoleItem | null>(null);

  const activeRole = user?.roles?.[0] || currentUserRole || "Super Admin";
  const ability = useMemo(() => defineAbilityFor(activeRole), [activeRole]);
  const isSuperAdmin = useMemo(() => {
    const norm = activeRole.toLowerCase().replace(/[-_\s]/g, "");
    return norm === "superadmin" || norm === "super_admin";
  }, [activeRole]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddRoleFormValues>({
    resolver: zodResolver(addRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: MODULES.map((m) => ({
        module: m.name,
        create: false,
        read: false,
        update: false,
        delete: false,
      })),
    },
  });

  const permissionsArray = watch("permissions") || [];

  const permissionsRecord = useMemo(() => {
    const rec: Record<string, boolean> = {};
    permissionsArray.forEach((p) => {
      rec[`${p.module}-module`] = p.create || p.read || p.update || p.delete;
      rec[`${p.module}-create`] = p.create;
      rec[`${p.module}-read`] = p.read;
      rec[`${p.module}-update`] = p.update;
      rec[`${p.module}-delete`] = p.delete;
    });
    return rec;
  }, [permissionsArray]);

  const handlePermissionsChange = (newRecord: Record<string, boolean>) => {
    const updatedArray = MODULES.map((m) => ({
      module: m.name,
      create: !!newRecord[`${m.name}-create`],
      read: !!newRecord[`${m.name}-read`],
      update: !!newRecord[`${m.name}-update`],
      delete: !!newRecord[`${m.name}-delete`],
    }));
    setValue("permissions", updatedArray, { shouldValidate: true });
  };

  const rolesToDisplay = useMemo(() => {
    return roles.filter((role) => {
      const norm = role.name.toLowerCase().replace(/[-_\s]/g, "");
      return norm !== "superadmin" && norm !== "super_admin";
    });
  }, [roles]);

  const handleOpenAddRole = () => {
    setEditingRole(null);
    reset({
      name: "",
      description: "",
      permissions: MODULES.map((m) => ({
        module: m.name,
        create: false,
        read: false,
        update: false,
        delete: false,
      })),
    });
    setNotification(null);
    setIsAddRoleDialogOpen(true);
  };

  const handleOpenEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setNotification(null);
    reset({
      name: role.name,
      description: role.description || "",
      permissions: MODULES.map((m) => {
        const p = role.permissions?.find((perm) => perm.module.toUpperCase() === m.name.toUpperCase());
        return {
          module: m.name,
          create: p ? !!p.create : false,
          read: p ? !!p.read : false,
          update: p ? !!p.update : false,
          delete: p ? !!p.delete : false,
        };
      }),
    });
    setIsAddRoleDialogOpen(true);
  };

  const onSubmit = async (values: AddRoleFormValues) => {
    setNotification(null);

    try {
      if (editingRole) {
        const changedPermissions = values.permissions
          .map((newPerm) => {
            const oldPerm = editingRole.permissions?.find(
              (p) => p.module.toUpperCase() === newPerm.module.toUpperCase()
            );

            const oldCreate = oldPerm ? !!oldPerm.create : false;
            const oldRead = oldPerm ? !!oldPerm.read : false;
            const oldUpdate = oldPerm ? !!oldPerm.update : false;
            const oldDelete = oldPerm ? !!oldPerm.delete : false;

            const diff: any = { module: newPerm.module };
            let hasChanges = false;

            if (newPerm.create !== oldCreate) {
              diff.create = newPerm.create;
              hasChanges = true;
            }
            if (newPerm.read !== oldRead) {
              diff.read = newPerm.read;
              hasChanges = true;
            }
            if (newPerm.update !== oldUpdate) {
              diff.update = newPerm.update;
              hasChanges = true;
            }
            if (newPerm.delete !== oldDelete) {
              diff.delete = newPerm.delete;
              hasChanges = true;
            }

            return hasChanges ? diff : null;
          })
          .filter(Boolean);

        const hasNameChanged = values.name.trim() !== editingRole.name.trim();
        const hasDescriptionChanged = values.description.trim() !== (editingRole.description || "").trim();

        if (changedPermissions.length === 0 && !hasNameChanged && !hasDescriptionChanged) {
          setIsAddRoleDialogOpen(false);
          return;
        }

        await updateRole(editingRole.id, {
          name: values.name.trim(),
          description: values.description.trim(),
          permissions: changedPermissions,
        });
        toast.success(`Role "${values.name.trim()}" successfully updated!`);
      } else {
        const finalPermissions = values.permissions.filter(
          (p) => p.create || p.read || p.update || p.delete
        );

        await addRole({
          name: values.name.trim(),
          description: values.description.trim(),
          permissions: finalPermissions,
        });
        toast.success(`Role "${values.name.trim()}" successfully created!`);
      }

      setIsAddRoleDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      console.error("[RolesClient] save error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to save role";
      setNotification({
        message: errMsg,
        type: "error",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Access Roles"
        description="Configure access levels and permissions for predefined and custom roles."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admins")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admins
            </Button>
            {isSuperAdmin && (
              <Button
                size="sm"
                onClick={handleOpenAddRole}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Role
              </Button>
            )}
          </div>
        }
      />

      <PageBody>
        {rolesError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-destructive" />
            <div>
              <span className="font-semibold">Error loading roles:</span> {rolesError}
            </div>
          </div>
        )}

        {isRolesLoading ? (
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-card shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground animate-pulse">Fetching access roles...</p>
          </div>
        ) : (
          <DataTable
            rows={rolesToDisplay}
            columns={[
              {
                key: "name",
                label: "Role Name",
                render: (role) => {
                  const displayName = getRoleDisplayName(role.name);
                  return (
                    <span className="font-medium text-foreground text-sm capitalize">
                      {displayName}
                    </span>
                  );
                },
              },
              {
                key: "description",
                label: "Description",
                render: (role) => (
                  <span className="text-muted-foreground text-sm">
                    {role.description || "Custom role with specific module level permissions."}
                  </span>
                ),
              },
              {
                key: "permissions",
                label: "Module Permissions",
                render: (role) => {
                  return (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingRolePermissions(role)}
                      className="h-8 font-semibold text-xs flex items-center gap-1.5 hover:bg-muted/80 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      View Permissions
                    </Button>
                  );
                },
              },
              {
                key: "actions",
                label: "",
                className: "text-right",
                render: (r) => {
                  const isSystem = ["super-admin", "operations-admin", "finance-admin", "support-executive", "superadmin", "super_admin"].includes(r.id) ||
                    ["super admin", "operations admin", "finance admin", "support executive"].includes(r.name.toLowerCase());
                  const canEdit = isSuperAdmin && !isSystem;

                  return (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditRole(r)}
                        disabled={!canEdit}
                        title={isSystem ? "Predefined system roles cannot be modified" : !isSuperAdmin ? "Only Super Admin can edit roles" : ""}
                        className={!canEdit ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  );
                },
              },
            ]}
          />
        )}
      </PageBody>

      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Access Role" : "Add Access Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Modify the details and module-level permissions for this access role."
                : "Create a new access role and configure module-level CRUD permissions."}
            </DialogDescription>
          </DialogHeader>

          {notification && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm transition-all shadow-xs ${notification.type === "success"
                  ? "border-primary/20 bg-primary/5 text-primary"
                  : "border-destructive/20 bg-destructive/5 text-destructive"
                }`}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Role Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">
                    Role Name / Identifier <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    placeholder="e.g., customer_support"
                    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">Use lowercase letters, numbers, and underscores (e.g. support_admin).</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="description"
                    placeholder="e.g., Customer support and review moderation"
                    className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Module Permissions
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">Assign access levels per module</span>
              </div>

              <PermissionsMatrix
                permissions={permissionsRecord}
                onChange={handlePermissionsChange}
                modules={MODULES}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRoleDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingRolePermissions} onOpenChange={(open) => !open && setViewingRolePermissions(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl border bg-background shadow-2xl">
          {viewingRolePermissions && (
            <>
              <DialogHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <Shield className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      {getRoleDisplayName(viewingRolePermissions.name)}
                      <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase bg-muted text-muted-foreground border-border/80 py-0.5 px-2">
                        Permissions Matrix
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1 font-medium">
                      {viewingRolePermissions.description || "Custom role with specific module level permissions."}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-6">
                {(() => {
                  const isSuper =
                    viewingRolePermissions.name.toLowerCase().replace(/[-_\s]/g, "") === "superadmin" ||
                    viewingRolePermissions.name.toLowerCase().replace(/[-_\s]/g, "") === "super_admin";

                  if (isSuper) {
                    return (
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-xs">
                          <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-1">Full System Access</h4>
                            <p className="text-xs text-primary/95 leading-relaxed font-medium">
                              This role possesses administrative bypass privileges and is granted Full Access across all functional modules.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {MODULES.map((m) => (
                            <div
                              key={m.name}
                              className="flex items-center justify-between p-3.5 rounded-xl border border-primary/10 bg-primary/5/30 transition-all hover:shadow-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">{m.name}</span>
                              </div>
                              <Badge className="bg-primary/20 text-primary border-0 font-bold text-[9px] uppercase tracking-wide px-2 py-0.5">
                                Full Control
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const permissions = viewingRolePermissions.permissions || [];
                  const hasAnyPermission = permissions.some(p => p.create || p.read || p.update || p.delete);

                  if (!hasAnyPermission) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-2xl bg-muted/10">
                        <Lock className="h-10 w-10 text-muted-foreground/60 mb-3" />
                        <p className="text-sm font-semibold text-foreground">No Permissions Configured</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm text-center">
                          This role has no permissions assigned. Update the role to grant access to modules.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MODULES.map((m) => {
                        const p = permissions.find((perm) => perm.module.toUpperCase() === m.name.toUpperCase());
                        const hasCreate = !!p?.create;
                        const hasRead = !!p?.read;
                        const hasUpdate = !!p?.update;
                        const hasDelete = !!p?.delete;
                        const hasAny = hasCreate || hasRead || hasUpdate || hasDelete;

                        return (
                          <div
                            key={m.name}
                            className={`p-4 rounded-xl border transition-all duration-150 ${hasAny
                                ? "border-primary/20 bg-card shadow-xs"
                                : "border-border/40 bg-muted/10 opacity-60"
                              }`}
                          >
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${hasAny ? "bg-primary" : "bg-muted-foreground/45"}`} />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                  {m.name}
                                </span>
                              </div>
                              {hasAny ? (
                                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20 py-0.5 px-2">
                                  Active
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/75 font-semibold">
                                  <Lock className="h-3 w-3" />
                                  No Access
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hasCreate
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted/30 border-transparent text-muted-foreground/50"
                                  }`}
                              >
                                <span className="font-semibold text-[10px] tracking-wide uppercase">Create</span>
                                {hasCreate ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <X className="h-3.5 w-3.5 opacity-40" />
                                )}
                              </div>

                              <div
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hasRead
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted/30 border-transparent text-muted-foreground/50"
                                  }`}
                              >
                                <span className="font-semibold text-[10px] tracking-wide uppercase">Read</span>
                                {hasRead ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <X className="h-3.5 w-3.5 opacity-40" />
                                )}
                              </div>

                              <div
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hasUpdate
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted/30 border-transparent text-muted-foreground/50"
                                  }`}
                              >
                                <span className="font-semibold text-[10px] tracking-wide uppercase">Update</span>
                                {hasUpdate ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <X className="h-3.5 w-3.5 opacity-40" />
                                )}
                              </div>

                              <div
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hasDelete
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted/30 border-transparent text-muted-foreground/50"
                                  }`}
                              >
                                <span className="font-semibold text-[10px] tracking-wide uppercase">Delete</span>
                                {hasDelete ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <X className="h-3.5 w-3.5 opacity-40" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <DialogFooter className="border-t border-border pt-4">
                <Button
                  type="button"
                  onClick={() => setViewingRolePermissions(null)}
                  className="w-full sm:w-auto font-medium"
                >
                  Close Viewer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
