"use client";

import { useState } from "react";
import { AlertCircle, CreditCard, Building2, CheckCircle2, Check, X, RotateCcw, Clock, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BankVerificationItem, BankAccount, ReviewPayload } from "@/services/verification.service";
import { ReviewDialog } from "@/components/reviewDialog";

interface BankDetailsTabProps {
  bankAccounts: BankVerificationItem[];
  isReviewing: boolean;
  onReview: (id: string, payload: ReviewPayload) => Promise<void>;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/50 font-bold",
  rejected: "bg-red-50 text-red-700 border-red-200/50",
  resubmission: "bg-amber-50 text-amber-700 border-amber-200/50",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  resubmission: "Resubmission",
};

export function BankDetailsTab({ bankAccounts, isReviewing, onReview }: BankDetailsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject" | "resubmit">("approve");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const openDialog = (
    type: "approve" | "reject" | "resubmit",
    accountId: string,
    accountHolderName: string
  ) => {
    setDialogType(type);
    setSelectedId(accountId);
    setSelectedName(accountHolderName);
    setDialogOpen(true);
  };

  const handleConfirm = async (payload: ReviewPayload) => {
    if (!selectedId) return;
    await onReview(selectedId, payload);
    setDialogOpen(false);
  };

  const allBankAccounts = bankAccounts.flatMap(chef =>
    chef.bankAccounts && chef.bankAccounts.length > 0
      ? chef.bankAccounts.map(acct => ({ chef, acct }))
      : [{ chef, acct: null as BankAccount | null }]
  );

  if (bankAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No bank account verifications found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No submissions match the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allBankAccounts.map(({ chef, acct }, idx) => {
          if (!acct) {
            return (
              <div
                key={`${chef.chefId || idx}-empty`}
                className="bg-card rounded-xl border p-4 flex flex-col gap-3 shadow-xs border-border opacity-75"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground leading-snug truncate">
                      {chef.displayName || chef.businessName || "—"}
                    </h3>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${STATUS_BADGE.pending}`}>
                    No Data
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground flex flex-col items-center justify-center flex-1 min-h-[60px] bg-secondary/20 rounded-md border border-dashed border-border/50 p-2 text-center">
                  <Banknote className="h-5 w-5 mb-1 opacity-50" />
                  No bank details provided yet
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-auto">
                  <Button disabled className="flex items-center justify-center gap-1 h-8 bg-muted text-muted-foreground rounded-lg text-[11px] font-semibold transition-all">
                    Approve
                  </Button>
                  <Button disabled variant="outline" className="flex items-center justify-center gap-1 h-8 border border-border bg-card text-muted-foreground rounded-lg text-[11px] font-semibold transition-all">
                    Resubmit
                  </Button>
                  <Button disabled className="flex items-center justify-center gap-1 h-8 bg-muted text-muted-foreground rounded-lg text-[11px] font-semibold transition-all">
                    Reject
                  </Button>
                </div>
              </div>
            );
          }

          const status = acct.approvalStatus;
          const cardBorder =
            status === "approved"
              ? "border-emerald-500/30 hover:border-emerald-500/50"
              : status === "rejected"
                ? "border-destructive/30 hover:border-destructive/50"
                : status === "resubmission"
                  ? "border-amber-500/30 hover:border-amber-500/50"
                  : "border-border hover:shadow-md hover:border-slate-300";

          return (
            <div
              key={acct.id}
              className={`bg-card rounded-xl border p-4 flex flex-col gap-3 shadow-xs transition-all duration-300 ${cardBorder}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-snug truncate">
                    {acct.accountHolderName || chef.displayName || chef.businessName || "—"}
                  </h3>
                  {acct.bankName && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Banknote className="h-3 w-3" /> {acct.bankName} - {acct.branch}
                    </p>
                  )}
                  {acct.createdAt && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(acct.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${STATUS_BADGE[status] || STATUS_BADGE.pending}`}>
                  {STATUS_LABEL[status] || status}
                </span>
              </div>

              <div className="space-y-1">
                {acct.accountNumberLast4 && (
                  <div className="text-[11px] bg-secondary/30 rounded-md px-2 py-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Account No.</span>
                    <span className="font-mono font-semibold text-foreground">
                      ••••{acct.accountNumberLast4}
                    </span>
                  </div>
                )}
                {acct.ifsc && (
                  <div className="text-[11px] bg-secondary/30 rounded-md px-2 py-1 flex items-center justify-between">
                    <span className="text-muted-foreground">IFSC</span>
                    <span className="font-mono font-semibold text-foreground">{acct.ifsc}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-auto">
                <Button
                  onClick={() => openDialog("approve", acct.id, acct.accountHolderName)}
                  disabled={isReviewing || status === "approved" || status === "active"}
                  className="flex items-center justify-center gap-1 h-8 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openDialog("resubmit", acct.id, acct.accountHolderName)}
                  disabled={isReviewing || status === "approved" || status === "active"}
                  className="flex items-center justify-center gap-1 h-8 border border-border bg-card hover:bg-accent text-foreground rounded-lg text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3 text-muted-foreground" /> Resubmit
                </Button>
                <Button
                  onClick={() => openDialog("reject", acct.id, acct.accountHolderName)}
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
