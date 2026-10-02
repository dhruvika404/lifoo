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
  categoryName: string;
  onConfirm: () => Promise<void>;
};

export function DeleteCategoryModal({ open, onOpenChange, categoryName, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
  };

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border border-border bg-background shadow-2xl rounded-xl p-6">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 text-center">
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This action is permanent and cannot be undone. It may affect products and subcategories associated with <strong className="text-foreground">{categoryName}</strong>.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium flex-1 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="h-10 rounded-lg font-medium shadow-sm transition-all duration-200 flex-1 bg-destructive hover:bg-destructive/90 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting…
              </>
            ) : (
              "Delete Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
