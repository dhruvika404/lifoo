"use client";

import { useState } from "react";
import {
  AlertCircle,
  Flame,
  CheckCircle2,
  Check,
  X,
  Clock,
  Phone,
  Hash,
  FileText,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "@/components/reviewDialog";
import type { StoveRequest } from "@/services/verification.service";
import type { ReviewPayload } from "@/services/verification.service";

interface MultipleStoveTabProps {
  stoves: StoveRequest[];
  isLoading: boolean;
  isReviewing: boolean;
  totalItems: number;
  onReview: (id: string, payload: ReviewPayload) => Promise<void>;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/50 font-bold",
  rejected: "bg-red-50 text-red-700 border-red-200/50",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function MultipleStoveTab({
  stoves,
  isLoading,
  isReviewing,
  totalItems,
  onReview,
}: MultipleStoveTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject">("approve");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const openDialog = (type: "approve" | "reject", id: string, label: string) => {
    setDialogType(type);
    setSelectedId(id);
    setSelectedName(label);
    setDialogOpen(true);
  };

  const handleConfirm = async (payload: ReviewPayload) => {
    if (!selectedId) return;
    await onReview(selectedId, payload);
    setDialogOpen(false);
  };

  if (stoves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg text-foreground">No stove requests found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No stove addition requests match the current filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stoves.map((item) => {
          const status = item.status.toLowerCase();

          const cardBorder =
            status === "approved"
              ? "border-emerald-500/30 hover:border-emerald-500/50"
              : status === "rejected"
              ? "border-destructive/30 hover:border-destructive/50"
              : "border-border hover:shadow-md hover:border-slate-300";

          return (
            <div
              key={item.id}
              className={`bg-card rounded-xl border p-4 flex flex-col gap-3 shadow-xs transition-all duration-300 ${cardBorder}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-snug truncate flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500 shrink-0" />
                    {item.chefName}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {item.chefPhone}
                  </p>
                  {item.createdAt && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${
                    STATUS_BADGE[status] || STATUS_BADGE.pending
                  }`}
                >
                  {STATUS_LABEL[status] || status}
                </span>
              </div>

              {/* Details Box */}
              <div className="text-[11px] text-muted-foreground bg-secondary/30 rounded-md p-2.5 space-y-1.5">
                {/* Requested stoves count */}
                <p className="text-foreground font-medium flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Requested Stoves:&nbsp;</span>
                  <span className="font-bold text-amber-600">{item.requestedStoves}</span>
                </p>

                {/* Chef's reason */}
                {item.reason && (
                  <p className="flex items-start gap-1.5 pt-1 border-t border-border/50">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">Reason:&nbsp;</span>
                      {item.reason}
                    </span>
                  </p>
                )}

                {/* Admin review notes */}
                {item.reviewNotes && (
                  <p className="flex items-start gap-1.5 pt-1 border-t border-border/50">
                    <StickyNote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">Review Notes:&nbsp;</span>
                      {item.reviewNotes}
                    </span>
                  </p>
                )}
              </div>

              {/* Action Buttons — only Approve / Reject */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Button
                  onClick={() =>
                    openDialog("approve", item.id, `${item.chefName}'s stove request`)
                  }
                  disabled={isReviewing || status === "approved" || status === "active"}
                  className="flex items-center justify-center gap-1 h-8 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button
                  onClick={() =>
                    openDialog("reject", item.id, `${item.chefName}'s stove request`)
                  }
                  disabled={isReviewing || status === "rejected" || status === "approved" || status === "active"}
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
