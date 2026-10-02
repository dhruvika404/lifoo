"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, ShieldAlert, KeyRound, Edit2, ShieldCheck, CheckCircle2, Lock, Loader2, Search, UserX, UserCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdminStore, Admin } from "@/store/adminStore";
import { defineAbilityFor } from "@/lib/ability";
import { useAuthStore } from "@/store/authStore";
import { MODULES, getRoleDisplayName } from "./constants";
import { useDebounce } from "@/hooks/use-debounce";
import { AddEditAdminModal, AdminFormValues } from "./addEditAdminModal";
import { ResetPasswordModal } from "./resetPasswordModal";
import { StatusConfirmModal } from "./statusConfirmModal";

export function AdminsModule() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    admins,
    roles,
    isLoading,
    isRolesLoading,
    error,
    currentUserRole,
    fetchAdmins,
    fetchRoles,
    addAdmin,
    editAdmin,
    resetPassword,
    toggleAdminStatus,
  } = useAdminStore();

  const activeRole = user?.roles?.[0] || currentUserRole || "Super Admin";
  const isSuperAdmin = useMemo(() => {
    const norm = activeRole.toLowerCase().replace(/[-_\s]/g, "");
    return norm === "superadmin" || norm === "super_admin";
  }, [activeRole]);

  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const debouncedAdminSearchQuery = useDebounce(adminSearchQuery, 300);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchAdmins(debouncedAdminSearchQuery);
  }, [debouncedAdminSearchQuery, fetchAdmins]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusAdmin, setStatusAdmin] = useState<Admin | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetAdmin, setResetAdmin] = useState<Admin | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const ability = useMemo(() => defineAbilityFor(activeRole), [activeRole]);

  const displayedAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const roleStr = typeof admin.role === "object" && admin.role !== null
        ? (admin.role as any).name || (admin.role as any).id || ""
        : String(admin.role || "");
      const norm = roleStr.toLowerCase().replace(/[-_\s]/g, "");
      return norm !== "superadmin" && norm !== "super_admin";
    });
  }, [admins]);

  const rolesToDisplay = useMemo(() => {
    const defaultRolesWithMetadata = [
      {
        id: "super-admin",
        name: "Super Admin",
      },
      {
        id: "operations-admin",
        name: "Operations Admin",
      },
      {
        id: "finance-admin",
        name: "Finance Admin",
      },
      {
        id: "support-executive",
        name: "Support Executive",
      },
    ];

    const combined = [...roles];

    defaultRolesWithMetadata.forEach((defRole) => {
      const exists = combined.some(
        (r) => r.name.toLowerCase().replace(/[-_\s]/g, "") === defRole.name.toLowerCase().replace(/[-_\s]/g, "")
      );
      if (!exists) {
        combined.push(defRole as any);
      }
    });

    return combined;
  }, [roles]);

  const { rolesShown, remainingCount } = useMemo(() => {
    const superAdminRole = rolesToDisplay.find(
      (r) => {
        const norm = r.name.toLowerCase().replace(/[-_\s]/g, "");
        return norm === "superadmin" || norm === "super_admin";
      }
    );

    const otherRoles = rolesToDisplay.filter(
      (r) => {
        const norm = r.name.toLowerCase().replace(/[-_\s]/g, "");
        return norm !== "superadmin" && norm !== "super_admin";
      }
    );

    const activeRoleNorm = activeRole.toLowerCase().replace(/[-_\s]/g, "");
    const activeRoleInOthers = otherRoles.find(
      (r) => r.name.toLowerCase().replace(/[-_\s]/g, "") === activeRoleNorm
    );

    const chosenOthers: typeof rolesToDisplay = [];
    if (activeRoleInOthers) {
      chosenOthers.push(activeRoleInOthers);
    }

    for (const r of otherRoles) {
      if (chosenOthers.length >= 3) break;
      if (!chosenOthers.some((o) => o.name === r.name)) {
        chosenOthers.push(r);
      }
    }

    chosenOthers.sort((a, b) => otherRoles.indexOf(a) - otherRoles.indexOf(b));

    const finalShown: typeof rolesToDisplay = [];
    if (superAdminRole) {
      finalShown.push(superAdminRole);
    }
    finalShown.push(...chosenOthers);

    const count = otherRoles.length - chosenOthers.length;
    return {
      rolesShown: finalShown,
      remainingCount: count > 0 ? count : 0,
    };
  }, [rolesToDisplay, activeRole]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const canCreate = ability.can("create", "Admin");
  const canUpdate = ability.can("update", "Admin");
  const canReset = ability.can("reset-password", "Admin");
  const canToggleStatus = ability.can("toggle-status", "Admin");

  const handleOpenAdd = () => {
    if (!canCreate) return;
    setEditingAdmin(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (admin: Admin) => {
    if (!canUpdate) return;
    setEditingAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleResetPassword = (admin: Admin) => {
    if (!canReset) return;
    setResetAdmin(admin);
    setIsResetDialogOpen(true);
  };

  const onResetSubmit = async (newPassword: string) => {
    if (!resetAdmin || !resetAdmin.id) {
      toast.error("User ID is missing");
      return;
    }
    try {
      await resetPassword(resetAdmin.id, newPassword);
      showNotification(`Password reset successfully for ${resetAdmin.name} (${resetAdmin.email}).`);
      setIsResetDialogOpen(false);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to reset password";
      toast.error(errMsg);
    }
  };

  const handleOpenStatusConfirm = (admin: Admin) => {
    if (!canToggleStatus) return;
    setStatusAdmin(admin);
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusAdmin || !statusAdmin.id) return;
    setIsStatusChanging(true);
    try {
      await toggleAdminStatus(statusAdmin.id, statusAdmin.status || "active");
      const nextStatus = (statusAdmin.status || "active").toLowerCase() === "active" ? "disabled" : "active";
      showNotification(`Account status for ${statusAdmin.name} updated to ${nextStatus}.`);
      setIsStatusDialogOpen(false);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update user status";
      toast.error(errMsg);
    } finally {
      setIsStatusChanging(false);
    }
  };

  const handleSaveAdmin = async (values: AdminFormValues, permissionsMap: Record<string, boolean>) => {
    const permissionsArray = MODULES.map((m) => ({
      module: m.name,
      create: !!permissionsMap[`${m.name}-create`],
      read: !!permissionsMap[`${m.name}-read`],
      update: !!permissionsMap[`${m.name}-update`],
      delete: !!permissionsMap[`${m.name}-delete`],
    }));

    if (editingAdmin) {
      if (!editingAdmin.id) throw new Error("Admin ID is missing");
      await editAdmin(editingAdmin.id, {
        name: values.name,
        email: values.email,
        role: values.role,
        phone: values.phone,
        permissions: permissionsArray,
      });
      showNotification(`Admin user "${values.name}" updated successfully.`);
    } else {
      await addAdmin({
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        permissions: permissionsArray,
        password: values.password,
      });
      showNotification(`New admin "${values.name}" created successfully.`);
    }
    setIsDialogOpen(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    const norm = role.toUpperCase();
    if (norm.includes("SUPER")) return "default";
    if (norm.includes("OPERATIONS") || norm.includes("OPERATION")) return "secondary";
    if (norm.includes("FINANCE")) return "outline";
    return "outline";
  };

  return (
    <>
      <PageHeader
        title="Admin Users & Permissions"
        description="Manage admin accounts, adjust roles, and enforce Role-Based Access Control (RBAC)"
        actions={
          isSuperAdmin ? (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              disabled={!canCreate}
              className={!canCreate ? "opacity-50 cursor-not-allowed" : ""}
            >
              {canCreate ? (
                <Plus className="h-4 w-4 mr-1" />
              ) : (
                <Lock className="h-4 w-4 mr-1" />
              )}
              Add User
            </Button>
          ) : null
        }
      />

      <PageBody>
        <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  System Access Roles
                </h3>
                <p className="text-xs text-muted-foreground">
                  Predefined access roles assigned to users. Your active role is highlighted.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {rolesShown.map((role) => {
                const isActive = activeRole.toLowerCase().replace(/[-_\s]/g, "") === role.name.toLowerCase().replace(/[-_\s]/g, "");
                return (
                  <div
                    key={role.id || role.name}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-sm font-semibold"
                        : "bg-background border-input text-muted-foreground"
                    }`}
                  >
                    {getRoleDisplayName(role.name)}
                  </div>
                );
              })}
              {remainingCount > 0 && (
                <div className="px-3 py-1.5 rounded-lg text-xs font-medium border border-input bg-muted/30 text-muted-foreground select-none">
                  + {remainingCount} more
                </div>
              )}
              {isSuperAdmin && (
                <Button
                  onClick={() => router.push("/roles")}
                  variant="outline"
                  size="sm"
                  className="h-auto px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:border-primary hover:text-primary transition-all cursor-pointer flex items-center gap-1 bg-background"
                  title="Add New Role"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Role
                </Button>
              )}
            </div>
          </div>
        </div>

        {notification && (
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary transition-all">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>{notification}</span>
          </div>
        )}

        {!canCreate && !canUpdate && (
          <div className="flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-xs text-warning-foreground">
            <ShieldAlert className="h-4 w-4 shrink-0 text-warning" />
            <div>
              <span className="font-semibold">View Only Access:</span> Your active role (
              <span className="font-semibold">{activeRole}</span>) is restricted from adding,
              editing, or resetting admin passwords.
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-destructive" />
            <div>
              <span className="font-semibold">Error loading admins:</span> {error}
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/75 transition-colors" />
            <Input
              type="text"
              placeholder="Search admins by name, email, or phone..."
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 rounded-lg border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
            />
            {adminSearchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAdminSearchQuery("")}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-all"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-card shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground animate-pulse">Fetching latest admin users...</p>
          </div>
        ) : (
          <DataTable
            rows={displayedAdmins}
            columns={[
              {
                key: "name",
                label: "Name",
                render: (r) => <span className="font-medium text-foreground">{r.name}</span>,
              },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              {
                key: "role",
                label: "Role",
                render: (r) => {
                  const roleObj = r.role as any;
                  const roleStr = roleObj && typeof roleObj === "object" ? (roleObj.name || roleObj.id || "") : String(r.role || "");
                  const displayName = getRoleDisplayName(roleStr);
                  return (
                    <Badge variant={getRoleBadgeVariant(displayName)} className="capitalize font-medium">
                      {displayName}
                    </Badge>
                  );
                },
              },
              {
                key: "status",
                label: "Status",
                render: (r) => <StatusBadge value={r.status || "active"} />,
              },
              {
                key: "actions",
                label: "",
                className: "text-right",
                render: (r) => (
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenStatusConfirm(r)}
                      disabled={!canToggleStatus}
                      title={!canToggleStatus ? "Only Super Admin can change status" : ""}
                      className={`h-8 px-2.5 transition-all duration-200 ${
                        (r.status || "active").toLowerCase() === "active"
                          ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 border-rose-200/65 dark:border-rose-900/50"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 border-emerald-200/65 dark:border-emerald-900/50"
                      } ${!canToggleStatus ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {(r.status || "active").toLowerCase() === "active" ? (
                        <>
                          <UserX className="h-3.5 w-3.5 mr-1" />
                          Disable
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(r)}
                      disabled={!canUpdate}
                      title={!canUpdate ? "Only Super Admin & Operations Admin can edit" : ""}
                      className={!canUpdate ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResetPassword(r)}
                      disabled={!canReset}
                      title={!canReset ? "Only Super Admin can reset password" : ""}
                      className={!canReset ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <KeyRound className="h-3 w-3 mr-1 text-muted-foreground" />
                      Reset Password
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </PageBody>

      <AddEditAdminModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingAdmin={editingAdmin}
        roles={roles}
        isRolesLoading={isRolesLoading}
        isSuperAdmin={isSuperAdmin}
        onSave={handleSaveAdmin}
      />

      <ResetPasswordModal
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        admin={resetAdmin}
        onReset={onResetSubmit}
      />

      <StatusConfirmModal
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        admin={statusAdmin}
        isStatusChanging={isStatusChanging}
        onConfirm={handleConfirmStatusChange}
      />
    </>
  );
}
