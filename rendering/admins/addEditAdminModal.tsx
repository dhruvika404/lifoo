"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ChevronDown, ChevronUp, Search, Eye, EyeOff, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PermissionsMatrix } from "@/components/permissionsMatrix";
import { useDebounce } from "@/hooks/use-debounce";
import { adminService } from "@/services";
import type { RoleItem } from "@/services/admin.service";
import { Admin } from "@/store/adminStore";
import { MODULES, getRoleDisplayName } from "./constants";

const adminFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  role: z.string().min(1, "Role is required"),
  password: z.string().optional(),
});

export type AdminFormValues = z.infer<typeof adminFormSchema>;

interface AddEditAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAdmin: Admin | null;
  roles: RoleItem[];
  isRolesLoading: boolean;
  isSuperAdmin: boolean;
  onSave: (values: AdminFormValues, permissions: Record<string, boolean>) => Promise<void>;
}

export function AddEditAdminModal({
  open,
  onOpenChange,
  editingAdmin,
  roles,
  isRolesLoading,
  isSuperAdmin,
  onSave,
}: AddEditAdminModalProps) {
  const [showCustomPermissions, setShowCustomPermissions] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const [dialogRoles, setDialogRoles] = useState<RoleItem[]>([]);
  const [isDialogRolesLoading, setIsDialogRolesLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(roleSearchQuery, 300);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
    },
  });

  const selectedRole = watch("role");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setDialogRoles(roles);
      setShowCustomPermissions(false);
      setShowAddPassword(false);

      if (editingAdmin) {
        const roleObj = roles.find(
          (r) =>
            r.name === editingAdmin.role ||
            getRoleDisplayName(r.name) === editingAdmin.role
        );

        reset({
          name: editingAdmin.name,
          email: editingAdmin.email,
          phone: editingAdmin.phone || "",
          role: roleObj ? roleObj.id : editingAdmin.role,
          password: "",
        });
      } else {
        reset({
          name: "",
          email: "",
          phone: "",
          role: roles[0]?.id || "",
          password: "",
        });
      }
    } else {
      setRoleSearchQuery("");
      setDialogRoles([]);
    }
  }, [open, editingAdmin, roles, reset]);

  useEffect(() => {
    if (!open) return;

    if (debouncedSearchQuery.trim() === "") {
      setDialogRoles(roles);
      return;
    }

    const loadSearchRoles = async () => {
      setIsDialogRolesLoading(true);
      try {
        const response = await adminService.getRoles(debouncedSearchQuery);
        if (response && response.ok && response.data) {
          setDialogRoles(response.data.items || []);
        }
      } catch (err) {
        console.error("[AddEditAdminModal] Failed to search roles:", err);
      } finally {
        setIsDialogRolesLoading(false);
      }
    };

    loadSearchRoles();
  }, [debouncedSearchQuery, open, roles]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasModuleAccess = (moduleName: string) => {
    const combinedRoles = [...roles, ...dialogRoles];
    if (!selectedRole || combinedRoles.length === 0) return true;

    const normalizeName = (n: string) => String(n).toLowerCase().replace(/[-_\s]/g, "");
    const targetNorm = normalizeName(selectedRole);

    const roleObj = combinedRoles.find(
      (r) =>
        r.id === selectedRole ||
        normalizeName(r.name) === targetNorm ||
        normalizeName(getRoleDisplayName(r.name)) === targetNorm
    );

    if (!roleObj) return true;

    if (normalizeName(roleObj.name) === "superadmin" || normalizeName(roleObj.name) === "super_admin") {
      return true;
    }

    return roleObj.permissions?.some((p) => p.module.toUpperCase() === moduleName.toUpperCase()) ?? false;
  };

  useEffect(() => {
    const combinedRoles = [...roles, ...dialogRoles];
    if (!selectedRole || combinedRoles.length === 0) return;

    const normalizeName = (n: string) => String(n).toLowerCase().replace(/[-_\s]/g, "");
    const targetNorm = normalizeName(selectedRole);

    const roleObj = combinedRoles.find(
      (r) =>
        r.id === selectedRole ||
        normalizeName(r.name) === targetNorm ||
        normalizeName(getRoleDisplayName(r.name)) === targetNorm
    );

    if (roleObj) {
      const updated: Record<string, boolean> = {};

      if (normalizeName(roleObj.name) === "superadmin" || normalizeName(roleObj.name) === "super_admin") {
        MODULES.forEach((m) => {
          updated[`${m.name}-module`] = true;
          if (m.hasCreate) updated[`${m.name}-create`] = true;
          if (m.hasRead) updated[`${m.name}-read`] = true;
          if (m.hasUpdate) updated[`${m.name}-update`] = true;
          if (m.hasDelete) updated[`${m.name}-delete`] = true;
        });
      } else {
        MODULES.forEach((m) => {
          updated[`${m.name}-module`] = false;
          updated[`${m.name}-create`] = false;
          updated[`${m.name}-read`] = false;
          updated[`${m.name}-update`] = false;
          updated[`${m.name}-delete`] = false;
        });

        if (roleObj.permissions && Array.isArray(roleObj.permissions)) {
          roleObj.permissions.forEach((p) => {
            const modName = p.module.toUpperCase();
            updated[`${modName}-module`] = p.create || p.read || p.update || p.delete;
            updated[`${modName}-create`] = p.create;
            updated[`${modName}-read`] = p.read;
            updated[`${modName}-update`] = p.update;
            updated[`${modName}-delete`] = p.delete;
          });
        }
      }

      const isOriginalRole = editingAdmin && (
        editingAdmin.role === selectedRole ||
        normalizeName(editingAdmin.role) === targetNorm ||
        editingAdmin.role === roleObj.id ||
        normalizeName(editingAdmin.role) === normalizeName(roleObj.name) ||
        normalizeName(editingAdmin.role) === normalizeName(getRoleDisplayName(roleObj.name))
      );

      if (isOriginalRole && editingAdmin.permissions && editingAdmin.permissions.length > 0) {
        editingAdmin.permissions.forEach((p) => {
          const modName = p.module.toUpperCase();
          updated[`${modName}-module`] = p.create || p.read || p.update || p.delete;
          updated[`${modName}-create`] = p.create;
          updated[`${modName}-read`] = p.read;
          updated[`${modName}-update`] = p.update;
          updated[`${modName}-delete`] = p.delete;
        });
      }

      setPermissions(updated);
    }
  }, [selectedRole, roles, dialogRoles, editingAdmin]);

  const handleSelectRole = (roleId: string) => {
    setValue("role", roleId, { shouldValidate: true });
    setIsRoleDropdownOpen(false);
    setRoleSearchQuery("");
  };

  const currentRoleObj = roles.find((r) => r.id === selectedRole) || dialogRoles.find((r) => r.id === selectedRole);
  const currentRoleName = currentRoleObj ? getRoleDisplayName(currentRoleObj.name) : "Select Role";

  const handleFormSubmit = async (values: AdminFormValues) => {
    if (!editingAdmin) {
      if (!values.password || values.password.length < 6) {
        setError("password", {
          type: "manual",
          message: "Password must be at least 6 characters",
        });
        return;
      }
    }

    try {
      await onSave(values, permissions);
    } catch (err) {
      // Error handled in parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAdmin ? "Edit Admin Member" : "Add User Account"}
          </DialogTitle>
          <DialogDescription>
            {editingAdmin
              ? "Update name and role permissions for this team member."
              : "Register a new user and assign their access permissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="e.g. Anjali Verma"
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. anjali@lifoo.in"
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {!editingAdmin && (
            <div className="space-y-1.5">
              <label htmlFor="add-password" className="text-xs font-semibold text-muted-foreground uppercase">
                Password
              </label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showAddPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowAddPassword(!showAddPassword)}
                  title={showAddPassword ? "Hide password" : "Show password"}
                >
                  {showAddPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5 relative" ref={roleDropdownRef}>
            <label htmlFor="role-trigger" className="text-xs font-semibold text-muted-foreground uppercase block">
              Access Role
            </label>
            <input type="hidden" {...register("role")} />
            <Button
              type="button"
              id="role-trigger"
              variant="outline"
              onClick={() => isSuperAdmin && !isRolesLoading && roles.length > 0 && setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              disabled={!isSuperAdmin || isRolesLoading || roles.length === 0}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-normal"
            >
              <span className="truncate">
                {isRolesLoading ? "Loading roles..." : roles.length === 0 ? "No roles available" : currentRoleName}
              </span>
              {isSuperAdmin && (
                isRoleDropdownOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )
              )}
            </Button>

            {isRoleDropdownOpen && (
              <div className="absolute z-[99] mt-1 w-full rounded-lg border border-border bg-card text-card-foreground shadow-lg animate-in fade-in-50 slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-2 border-b border-border/80 px-2.5 py-1.5">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    className="h-7 w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/70"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                  {isDialogRolesLoading ? (
                    <div className="flex items-center justify-center gap-2 px-2.5 py-3 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span>Searching roles...</span>
                    </div>
                  ) : dialogRoles.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-muted-foreground text-center">
                      No role found
                    </div>
                  ) : (
                    dialogRoles.map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <Button
                          key={role.id}
                          type="button"
                          variant="ghost"
                          onClick={() => handleSelectRole(role.id)}
                          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-left transition-colors cursor-pointer h-auto font-normal ${isSelected
                            ? "bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground"
                            : "hover:bg-muted/70 text-foreground"
                            }`}
                        >
                          <span className="truncate">{getRoleDisplayName(role.name)}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-current" />}
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            {errors.role && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-between text-xs font-medium border border-input h-9 px-3 hover:bg-accent/50"
              onClick={() => setShowCustomPermissions(!showCustomPermissions)}
            >
              <span>{showCustomPermissions ? "Hide Custom Roles for this User" : "Edit Custom Roles for this User"}</span>
              {showCustomPermissions ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          {showCustomPermissions && (
            <div className="space-y-3 pt-3 border-t border-border">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                update custom roles for this admin
              </label>
              <PermissionsMatrix
                permissions={permissions}
                onChange={setPermissions}
                modules={MODULES.filter((m) => hasModuleAccess(m.name))}
              />
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingAdmin ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
