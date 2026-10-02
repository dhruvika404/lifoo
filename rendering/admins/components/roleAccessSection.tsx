import React, { useState, useRef, useEffect, useMemo } from "react";
import { UseFormSetValue } from "react-hook-form";
import { Check, Search, ChevronDown, ChevronUp } from "lucide-react";
import { AddAdminFormValues } from "@/schemas";
import { DEFAULT_ROLES } from "@/rendering/admins/constants";
import { PermissionsMatrix } from "@/components/permissionsMatrix";
import { ModulePermissionConfig } from "@/types";

interface RoleAccessSectionProps {
  roleType: "default" | "custom";
  defaultRole: string;
  setValue: UseFormSetValue<AddAdminFormValues>;
  permissions: Record<string, boolean>;
  onPermissionsChange: (p: Record<string, boolean>) => void;
  modules: ModulePermissionConfig[];
}

export const RoleAccessSection: React.FC<RoleAccessSectionProps> = ({
  roleType,
  defaultRole,
  setValue,
  permissions,
  onPermissionsChange,
  modules,
}) => {
  const [defaultRoleSearchQuery, setDefaultRoleSearchQuery] = useState("");
  const [isDefaultRoleDropdownOpen, setIsDefaultRoleDropdownOpen] = useState(false);
  const defaultRoleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (defaultRoleDropdownRef.current && !defaultRoleDropdownRef.current.contains(event.target as Node)) {
        setIsDefaultRoleDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDefaultRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredDefaultRoles = useMemo(() => {
    return DEFAULT_ROLES.filter((role: string) =>
      role.toLowerCase().includes(defaultRoleSearchQuery.toLowerCase())
    );
  }, [defaultRoleSearchQuery]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Role & access
        </h3>

        {/* Selector Tabs */}
        <div className="flex border rounded-lg p-1 bg-muted/40 w-fit">
          <button
            type="button"
            onClick={() => setValue("roleType", "default")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              roleType === "default"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Default role
          </button>
          <button
            type="button"
            onClick={() => setValue("roleType", "custom")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              roleType === "custom"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Custom role
          </button>
        </div>
      </div>

      {/* Default Role Select View */}
      {roleType === "default" && (
        <div className="space-y-4 max-w-lg">
          <div className="space-y-1.5 relative" ref={defaultRoleDropdownRef}>
            <label htmlFor="default-role-trigger" className="text-xs font-semibold text-muted-foreground uppercase block">
              Select Predefined Role
            </label>
            <button
              type="button"
              id="default-role-trigger"
              onClick={() => setIsDefaultRoleDropdownOpen(!isDefaultRoleDropdownOpen)}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left cursor-pointer"
            >
              <span className="truncate">{defaultRole}</span>
              {isDefaultRoleDropdownOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>

            {isDefaultRoleDropdownOpen && (
              <div className="absolute z-[99] mt-1 w-full rounded-lg border border-border bg-card text-card-foreground shadow-lg animate-in fade-in-50 slide-in-from-top-1 duration-150">
                {/* Search Input Box */}
                <div className="flex items-center gap-2 border-b border-border/80 px-2.5 py-1.5">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={defaultRoleSearchQuery}
                    onChange={(e) => setDefaultRoleSearchQuery(e.target.value)}
                    className="h-7 w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/70"
                    autoFocus
                  />
                </div>

                {/* Options List */}
                <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                  {filteredDefaultRoles.length === 0 ? (
                    <div className="px-2.5 py-2 text-xs text-muted-foreground text-center">
                      No role found
                    </div>
                  ) : (
                    filteredDefaultRoles.map((roleName: string) => {
                      const isSelected = defaultRole === roleName;
                      return (
                        <button
                          key={roleName}
                          type="button"
                          onClick={() => {
                            setValue("defaultRole", roleName);
                            setIsDefaultRoleDropdownOpen(false);
                            setDefaultRoleSearchQuery("");
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted/70 text-foreground"
                          }`}
                        >
                          <span className="truncate">{roleName}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-current" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Role Permissions Overview
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {defaultRole === "Super Admin" &&
                "Full root authorization. Read, write, update and delete capabilities across all system modules including platform parameters and other accounts."}
              {defaultRole === "Operations Admin" &&
                "Manage catalogue slots, chefs onboarding, instant food ordering, delivery configurations and live channels. restricted from security settings."}
              {defaultRole === "Finance Admin" &&
                "Full balance and ledger settlement authorization. Manage finance payouts, wallet balances, refund disputes, and growth logs."}
              {defaultRole === "Content Moderator" &&
                "Read-only access to catalogs, with direct editing capability on customer review moderation, notifications and growth slots."}
              {defaultRole === "Support Executive" &&
                "Support ticket management. View customer logs, delivery routes, and stream feedback to assist operations."}
            </p>
          </div>
        </div>
      )}

      {/* Custom Permission Matrix Table View */}
      {roleType === "custom" && (
        <PermissionsMatrix
          permissions={permissions}
          onChange={onPermissionsChange}
          modules={modules}
        />
      )}
    </div>
  );
};
