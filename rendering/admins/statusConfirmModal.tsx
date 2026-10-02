"use client";

import React from "react";
import { Loader2, UserX, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Admin } from "@/store/adminStore";

interface StatusConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  isStatusChanging: boolean;
  onConfirm: () => Promise<void>;
}

export function StatusConfirmModal({
  open,
  onOpenChange,
  admin,
  isStatusChanging,
  onConfirm,
}: StatusConfirmModalProps) {
  const isActive = (admin?.status || "active").toLowerCase() === "active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 border transition-all ${
              isActive
                ? "bg-rose-500/10 text-rose-600 border-rose-500/25 animate-pulse"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 animate-pulse"
            }`}
          >
            {isActive ? <UserX className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
          </div>
          <DialogTitle>
            {isActive ? "Disable User Account" : "Enable User Account"}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {isActive ? (
              <>
                Are you sure you want to disable <strong>{admin?.name}</strong>'s account?
                They will lose access to the admin dashboard immediately and cannot log back in.
              </>
            ) : (
              <>
                Are you sure you want to enable <strong>{admin?.name}</strong>'s account?
                They will regain active access to the admin dashboard.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-row gap-2 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isStatusChanging}
            className="flex-1 max-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isStatusChanging}
            className={`flex-1 max-w-[120px] shadow-sm font-semibold transition-all ${
              isActive
                ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/15"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/15"
            }`}
          >
            {isStatusChanging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
              "Disable"
            ) : (
              "Enable"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
