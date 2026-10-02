"use client";

import { useState } from "react";
import {
  AlertCircle, Camera, CheckCircle2, RotateCcw,
  Check, X, Clock, Tag, ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductVerification, ReviewPayload, VerificationStatus } from "@/services/verification.service";
import { ReviewDialog } from "@/components/reviewDialog";

interface MenuTabProps {
  products: ProductVerification[];
  isReviewing: boolean;
  onReview: (id: string, payload: ReviewPayload) => Promise<void>;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/50 font-bold",
  rejected: "bg-red-50 text-red-700 border-red-200/50",
  resubmission: "bg-amber-50 text-amber-700 border-amber-200/50",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  rejected: "Rejected",
  resubmission: "Resubmission",
};

export function MenuTab({ products, isReviewing, onReview }: MenuTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject" | "resubmit">("approve");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const openDialog = (
    type: "approve" | "reject" | "resubmit",
    product: ProductVerification
  ) => {
    setDialogType(type);
    setSelectedId(product.id);
    setSelectedName(product.name || product.chefDisplayName || product.id);
    setDialogOpen(true);
  };

  const handleConfirm = async (payload: ReviewPayload) => {
    if (!selectedId) return;
    await onReview(selectedId, payload);
    setDialogOpen(false);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
        <Camera className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No menu item submissions found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No products match the current filters.
        </p>
        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl border border-dashed border-[#2d7a4f]/30 bg-[#2d7a4f]/5 max-w-md w-full text-left">
          <Camera className="h-5 w-5 text-[#2d7a4f] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Full Menu Review</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dish photos, nutritional compliance, and FSSAI category mapping are included in the review flow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items", count: products.length, icon: ChefHat, color: "text-foreground", bg: "bg-card" },
          { label: "Approved", count: products.filter((p) => p.status === "approved").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/50" },
          { label: "Pending", count: products.filter((p) => p.status === "pending").length, icon: Clock, color: "text-slate-600", bg: "bg-slate-50/50" },
          { label: "Action Required", count: products.filter((p) => p.status === "rejected" || p.status === "resubmission").length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50/50" },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border border-border ${bg}`}>
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <p className={`text-lg font-bold leading-none ${color}`}>{count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => {
          const cardBorder =
            product.status === "approved"
              ? "border-emerald-500/30 hover:border-emerald-500/50"
              : product.status === "rejected"
              ? "border-destructive/30 hover:border-destructive/50"
              : product.status === "resubmission"
              ? "border-amber-500/30 hover:border-amber-500/50"
              : "border-border hover:shadow-md hover:border-slate-300";

          return (
            <div
              key={product.id}
              className={`bg-card rounded-xl border p-4 flex flex-col gap-3 shadow-xs transition-all duration-300 ${cardBorder}`}
            >
              <div className="w-full h-32 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground/40" />
              </div>

              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-snug truncate">
                    {product.name || "—"}
                  </h3>
                  {product.chefDisplayName && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <ChefHat className="h-3 w-3" /> {product.chefDisplayName}
                    </p>
                  )}
                  {product.createdAt && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${STATUS_BADGE[product.status] || STATUS_BADGE.pending}`}>
                  {STATUS_LABEL[product.status] || product.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.description && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/40 rounded-md text-[11px] font-medium text-foreground border border-border">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {product.description}
                  </div>
                )}
                {product.price !== undefined && product.price !== null && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/40 rounded-md text-[11px] font-semibold text-foreground border border-border">
                    ₹{product.price}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-auto">
                <Button
                  onClick={() => openDialog("approve", product)}
                  disabled={isReviewing || product.status === "approved" || product.status === "active"}
                  className="flex items-center justify-center gap-1 h-8 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openDialog("resubmit", product)}
                  disabled={isReviewing || product.status === "approved" || product.status === "active"}
                  className="flex items-center justify-center gap-1 h-8 border border-border bg-card hover:bg-accent text-foreground rounded-lg text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3 text-muted-foreground" /> Resubmit
                </Button>
                <Button
                  onClick={() => openDialog("reject", product)}
                  disabled={isReviewing || product.status === "rejected" || product.status === "approved" || product.status === "active"}
                  className="flex items-center justify-center gap-1 h-8 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-3 w-3" /> Reject
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        itemName={selectedName}
        isSubmitting={isReviewing}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
