"use client";

import React, { useState } from "react";
import { Loader2, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chefName: string;
  onConfirm: () => Promise<void>;
};

export function SuspendChefModal({ open, onOpenChange, chefName, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (val: boolean) => {
    if (!isSubmitting) onOpenChange(val);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      // Handled in caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border border-border bg-background shadow-2xl rounded-xl p-6">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Ban className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 text-center">
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              Suspend Chef
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to suspend <strong className="text-foreground">{chefName}</strong>? This chef will no longer be able to accept orders or access the platform until reactivated.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="h-10 rounded-lg font-medium shadow-sm transition-all duration-200 flex-1 bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Suspending…
              </>
            ) : (
              "Suspend Chef"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
