"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { productService } from "@/services/product.service";

type Props = {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function EditTagsModal({ product, open, onOpenChange, onUpdated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open && product) {
      setTags(product.tags ?? []);
    }
  }, [open, product]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await productService.updateProductTags(product.id, tags);
      toast.success("Tags updated successfully.");
      onUpdated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update tags");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tags</label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tag and press Enter..."
            />
            <p className="text-[11px] text-muted-foreground/80 mt-1">
              Used for search, filtering, and curations (e.g., bestseller, chef-special).
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
