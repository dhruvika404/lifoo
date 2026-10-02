"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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
  promotionTitle: string;
  onConfirm: () => Promise<void>;
};

export function PromotionDeleteModal({ open, onOpenChange, promotionTitle, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is managed by the caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-md border border-border bg-background shadow-2xl rounded-2xl p-6 gap-4"
      >
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 text-center">
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
              Delete Promotion
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">"{promotionTitle}"</strong>? This action is permanent and cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-border/40 gap-2 sm:gap-2 flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-9 rounded-lg border border-border hover:bg-muted text-foreground font-medium flex-1 text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="h-9 rounded-lg font-medium shadow-xs flex-1 bg-destructive hover:bg-destructive/90 text-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
