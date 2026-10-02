"use client";

import { Check, RotateCcw, X, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VerificationItem } from "./types";

interface VerificationCardProps {
  chef: VerificationItem;
  onApprove: (chef: VerificationItem) => void;
  onReject: (chef: VerificationItem) => void;
  onResubmit: (chef: VerificationItem) => void;
  onPreview: (chef: VerificationItem, docType: string) => void;
}

export function VerificationCard({
  chef,
  onApprove,
  onReject,
  onResubmit,
  onPreview,
}: VerificationCardProps) {
  let badgeStyles = "bg-muted text-muted-foreground border-slate-200/80";
  if (chef.status === "Pending") {
    badgeStyles = "bg-slate-100 text-slate-700 border-slate-200";
  } else if (chef.status === "Approved") {
    badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200/50 font-bold";
  } else if (chef.status === "Rejected") {
    badgeStyles = "bg-red-50 text-red-700 border-red-200/50";
  } else if (chef.status === "Resubmission Requested") {
    badgeStyles = "bg-amber-50 text-amber-700 border-amber-200/50";
  }

  const cardBorderClass =
    chef.status === "Approved"
      ? "border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/5"
      : chef.status === "Rejected"
      ? "border-destructive/30 hover:border-destructive/50"
      : chef.status === "Resubmission Requested"
      ? "border-amber-500/30 hover:border-amber-500/50"
      : "border-border hover:shadow-md hover:border-slate-300";

  return (
    <div
      className={`bg-card rounded-xl border p-4 flex flex-col justify-between shadow-xs transition-all duration-300 ${cardBorderClass}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground leading-snug truncate">
            {chef.name}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {chef.owner} &bull; Submitted {chef.submitted}
          </p>
        </div>

        <div>
          <span
            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badgeStyles}`}
          >
            {chef.status === "Resubmission Requested" ? "Resubmission" : chef.status}
          </span>
        </div>
      </div>

      {chef.status === "Rejected" && chef.rejectionReason && (
        <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded-lg bg-red-50/50 border border-red-100 text-[11px] text-red-700">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 text-red-600" />
          <div>
            <span className="font-semibold">Rejection Reason:</span>{" "}
            {chef.rejectionReason}
          </div>
        </div>
      )}

      {chef.status === "Resubmission Requested" && chef.resubmissionReason && (
        <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded-lg bg-amber-50/50 border border-amber-100 text-[11px] text-amber-700">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Resubmission Requested for:</span>{" "}
            <span className="underline decoration-amber-400 font-medium">
              {chef.resubmissionDocs?.join(", ")}
            </span>
            <p className="mt-0.5 text-amber-600/90 italic">
              &quot;{chef.resubmissionReason}&quot;
            </p>
          </div>
        </div>
      )}

      <div className="my-4">
        <div className="flex flex-wrap gap-1.5">
          {chef.documents.map((doc: string) => {
            const isRequested =
              chef.status === "Resubmission Requested" &&
              chef.resubmissionDocs?.includes(doc);
            return (
              <button
                key={doc}
                onClick={() => onPreview(chef, doc)}
                className={`flex items-center gap-1 px-2 py-1 border rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer shadow-xs ${
                  isRequested
                    ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100/80"
                    : "bg-secondary/40 text-foreground border-border hover:bg-secondary/80 hover:border-slate-300"
                }`}
              >
                <Eye
                  className={`h-2.5 w-2.5 ${
                    isRequested ? "text-amber-600" : "text-muted-foreground"
                  }`}
                />
                {doc}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Button
          onClick={() => onApprove(chef)}
          disabled={chef.status === "Approved"}
          className="flex items-center justify-center gap-1 h-8 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Check className="h-3 w-3" />
          Approve
        </Button>

        <Button
          variant="outline"
          onClick={() => onResubmit(chef)}
          className="flex items-center justify-center gap-1 h-8 border border-border bg-card hover:bg-accent text-foreground rounded-lg text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="h-3 w-3 text-muted-foreground" />
          Resubmit
        </Button>

        <Button
          onClick={() => onReject(chef)}
          disabled={chef.status === "Rejected"}
          className="flex items-center justify-center gap-1 h-8 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <X className="h-3 w-3" />
          Reject
        </Button>
      </div>
    </div>
  );
}
