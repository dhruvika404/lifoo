"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/pageShell";
import { FolderOpen, Shield, Layers, Calendar, Package } from "lucide-react";
import type { Category } from "@/services/category.service";
import { format } from "date-fns";
import { getS3ImageUrl } from "@/lib/s3-utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ViewCategoryModal({ category, open, onOpenChange }: Props) {
  if (!category) return null;

  const imageUrl = getS3ImageUrl(category.imageUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border border-border shadow-xl rounded-xl">
        <div className="relative h-48 bg-muted w-full flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center blur-sm opacity-50 scale-110"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              <img
                src={imageUrl}
                alt={category.name}
                className="relative z-10 h-full w-full object-contain p-4 drop-shadow-md"
              />
            </>
          ) : (
            <FolderOpen className="h-16 w-16 text-muted-foreground/30" />
          )}
          <div className="absolute top-4 left-4 z-20">
            <StatusBadge value={category.active ? "Active" : "Disabled"} />
          </div>
        </div>

        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {category.name}
            </DialogTitle>
            <DialogDescription className="text-sm font-mono text-muted-foreground">
              /{category.slug}
            </DialogDescription>
          </DialogHeader>

          {category.description ? (
            <p className="text-sm text-foreground/90 mb-6 leading-relaxed">
              {category.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-6">
              No description provided.
            </p>
          )}

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compliance</span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Shield className="h-4 w-4 text-[#2d7a4f]" />
                {category.complianceRegime || "N/A"}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort Order</span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Layers className="h-4 w-4 text-[#2d7a4f]" />
                {category.sortOrder}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Package className="h-4 w-4 text-[#2d7a4f]" />
                {category.productCount ?? 0}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Calendar className="h-4 w-4 text-[#2d7a4f]" />
                {category.createdAt ? format(new Date(category.createdAt), "MMM d, yyyy") : "N/A"}
              </div>
            </div>
          </div>

          {category.tags && category.tags.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {category.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#2d7a4f]/10 text-[#2d7a4f] hover:bg-[#2d7a4f]/20 font-medium text-xs border border-[#2d7a4f]/20 px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}