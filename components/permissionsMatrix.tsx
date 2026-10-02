import React from "react";
import { Check, Minus } from "lucide-react";
import { ModulePermissionConfig } from "@/types";

interface PermissionsMatrixProps {
  permissions: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  modules: ModulePermissionConfig[];
}

export const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  permissions,
  onChange,
  modules,
}) => {
  // Custom checkbox component
  const CustomCheckbox = ({
    checked,
    onChange: onCheckboxChange,
    className = "mx-auto",
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
  }) => {
    return (
      <button
        type="button"
        onClick={() => onCheckboxChange(!checked)}
        className={`flex h-5 w-5 items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${className} ${
          checked
            ? "rounded-full bg-foreground text-background scale-105 shadow-sm"
            : "rounded-md border border-input bg-card hover:border-muted-foreground/45"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </button>
    );
  };

  // Row-level module toggle
  const handleModuleToggle = (moduleName: string) => {
    const m = modules.find((mod) => mod.name === moduleName);
    if (!m) return;

    const key = `${moduleName}-module`;
    const nextVal = !permissions[key];

    const updated = { ...permissions, [key]: nextVal };

    const actionsList = ["create", "read", "update", "delete"];
    actionsList.forEach((act) => {
      const supports =
        (act === "create" && m.hasCreate) ||
        (act === "read" && m.hasRead) ||
        (act === "update" && m.hasUpdate) ||
        (act === "delete" && m.hasDelete);
      if (supports) {
        updated[`${moduleName}-${act}`] = nextVal;
      }
    });

    onChange(updated);
  };

  // Action toggle
  const handleActionToggle = (moduleName: string, action: string) => {
    const key = `${moduleName}-${action}`;
    const nextVal = !permissions[key];

    const updated = { ...permissions, [key]: nextVal };

    if (nextVal) {
      updated[`${moduleName}-module`] = true;
    } else {
      const rowActions = ["create", "read", "update", "delete"];
      const anyChecked = rowActions.some((act) => updated[`${moduleName}-${act}`]);
      if (!anyChecked) {
        updated[`${moduleName}-module`] = false;
      }
    }

    onChange(updated);
  };

  // Column-level toggle
  const toggleColumn = (action: string) => {
    const activeRows = modules.filter((m) => {
      if (action === "module") return true;
      if (action === "create") return m.hasCreate;
      if (action === "read") return m.hasRead;
      if (action === "update") return m.hasUpdate;
      if (action === "delete") return m.hasDelete;
      return false;
    });

    const anyChecked = activeRows.some((m) => permissions[`${m.name}-${action}`]);

    const updated = { ...permissions };
    activeRows.forEach((m) => {
      const key = `${m.name}-${action}`;
      updated[key] = !anyChecked;

      if (action !== "module") {
        if (!anyChecked) {
          updated[`${m.name}-module`] = true;
        } else {
          const rowActions = ["create", "read", "update", "delete"];
          const anyOtherActionChecked = rowActions.some((act) => {
            if (act === action) return false;
            return updated[`${m.name}-${act}`];
          });
          if (!anyOtherActionChecked) {
            updated[`${m.name}-module`] = false;
          }
        }
      } else {
        const actionsList = ["create", "read", "update", "delete"];
        actionsList.forEach((act) => {
          const supports =
            (act === "create" && m.hasCreate) ||
            (act === "read" && m.hasRead) ||
            (act === "update" && m.hasUpdate) ||
            (act === "delete" && m.hasDelete);
          if (supports) {
            updated[`${m.name}-${act}`] = !anyChecked;
          }
        });
      }
    });

    onChange(updated);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/40 border-b border-border">
            {/* Header Column 1 */}
            <th className="p-4 w-[240px]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleColumn("module")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-105 shrink-0 cursor-pointer"
                  title="Toggle all modules"
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                  Module
                </span>
              </div>
            </th>
            {/* Header Column 2 */}
            <th className="p-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => toggleColumn("create")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-105 shrink-0 cursor-pointer"
                  title="Toggle all Create permissions"
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                  Create
                </span>
              </div>
            </th>
            {/* Header Column 3 */}
            <th className="p-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => toggleColumn("read")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-105 shrink-0 cursor-pointer"
                  title="Toggle all Read permissions"
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                  Read
                </span>
              </div>
            </th>
            {/* Header Column 4 */}
            <th className="p-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => toggleColumn("update")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-105 shrink-0 cursor-pointer"
                  title="Toggle all Update permissions"
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                  Update
                </span>
              </div>
            </th>
            {/* Header Column 5 */}
            <th className="p-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => toggleColumn("delete")}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-105 shrink-0 cursor-pointer"
                  title="Toggle all Delete permissions"
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                  Delete
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {modules.map((m) => {
            const isModuleChecked = !!permissions[`${m.name}-module`];
            const isCreateChecked = !!permissions[`${m.name}-create`];
            const isReadChecked = !!permissions[`${m.name}-read`];
            const isUpdateChecked = !!permissions[`${m.name}-update`];
            const isDeleteChecked = !!permissions[`${m.name}-delete`];

            return (
              <tr
                key={m.name}
                className={`transition-colors hover:bg-muted/15 ${
                  isModuleChecked ? "bg-muted/5" : ""
                }`}
              >
                {/* Module Name Row Header */}
                <td className="p-4 border-r border-border/40">
                  <div className="flex items-center gap-3">
                    <CustomCheckbox
                      checked={isModuleChecked}
                      onChange={() => handleModuleToggle(m.name)}
                      className=""
                    />
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isModuleChecked ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                </td>

                {/* Create Checkbox */}
                <td className="p-4 text-center">
                  {m.hasCreate ? (
                    <CustomCheckbox
                      checked={isCreateChecked}
                      onChange={() => handleActionToggle(m.name, "create")}
                    />
                  ) : (
                    <span className="text-muted-foreground/20 font-medium">—</span>
                  )}
                </td>

                {/* Read Checkbox */}
                <td className="p-4 text-center">
                  {m.hasRead ? (
                    <CustomCheckbox
                      checked={isReadChecked}
                      onChange={() => handleActionToggle(m.name, "read")}
                    />
                  ) : (
                    <span className="text-muted-foreground/20 font-medium">—</span>
                  )}
                </td>

                {/* Update Checkbox */}
                <td className="p-4 text-center">
                  {m.hasUpdate ? (
                    <CustomCheckbox
                      checked={isUpdateChecked}
                      onChange={() => handleActionToggle(m.name, "update")}
                    />
                  ) : (
                    <span className="text-muted-foreground/20 font-medium">—</span>
                  )}
                </td>

                {/* Delete Checkbox */}
                <td className="p-4 text-center">
                  {m.hasDelete ? (
                    <CustomCheckbox
                      checked={isDeleteChecked}
                      onChange={() => handleActionToggle(m.name, "delete")}
                    />
                  ) : (
                    <span className="text-muted-foreground/20 font-medium">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
