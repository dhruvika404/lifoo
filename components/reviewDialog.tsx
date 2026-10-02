"use client";

import { useState } from "react";
import {
  CheckCircle2, X, RotateCcw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type ReviewActionType = "approve" | "reject" | "resubmit";

export interface ReviewPayload {
  action: ReviewActionType;
  reason?: string;
}

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ReviewActionType;
  itemName: string;
  isSubmitting: boolean;
  onConfirm: (payload: ReviewPayload) => Promise<void>;
  title?: string;
  description?: React.ReactNode;
}

export function ReviewDialog({
  open,
  onOpenChange,
  type,
  itemName,
  isSubmitting,
  onConfirm,
  title,
  description,
}: ReviewDialogProps) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const needsReason = type === "reject" || type === "resubmit";

  const handleSubmit = async () => {
    if (needsReason && reason.trim().length < 5) {
      setReasonError("Reason must be at least 5 characters.");
      return;
    }
    setReasonError("");
    const action =
      type === "approve" ? "approve" : type === "reject" ? "reject" : "resubmit";
    const payload: ReviewPayload = {
      action,
      ...(needsReason ? { reason: reason.trim() } : {}),
    };
    await onConfirm(payload);
    setReason("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setReasonError("");
      onOpenChange(false);
    }
  };

  const config = {
    approve: {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      title: title || "Approve",
      titleClass: "text-foreground",
      desc: description || (
        <>
          Are you sure you want to approve this for{" "}
          <span className="font-semibold text-foreground">{itemName}</span>?
        </>
      ),
      btnClass: "bg-[#2d7a4f] hover:bg-[#236040] text-white",
      btnLabel: "Confirm Approval",
      loadingLabel: "Approving...",
    },
    reject: {
      icon: <X className="h-5 w-5 rounded-full bg-red-100 p-0.5 text-destructive" />,
      title: title || "Reject",
      titleClass: "text-destructive",
      desc: description || (
        <>
          Specify the reason for rejecting{" "}
          <span className="font-semibold text-foreground">{itemName}</span>.
        </>
      ),
      btnClass: "bg-red-600 hover:bg-red-700 text-white",
      btnLabel: "Reject",
      loadingLabel: "Rejecting...",
    },
    resubmit: {
      icon: <RotateCcw className="h-5 w-5 text-amber-600" />,
      title: title || "Request Resubmission",
      titleClass: "text-foreground",
      desc: description || (
        <>
          Provide instructions for{" "}
          <span className="font-semibold text-foreground">{itemName}</span> to
          correct their submission.
        </>
      ),
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
      btnLabel: "Send Request",
      loadingLabel: "Sending...",
    },
  }[type];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 font-bold ${config.titleClass}`}>
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            {config.desc}
          </DialogDescription>
        </DialogHeader>

        {needsReason && (
          <div className="space-y-2 py-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              {type === "reject" ? "Reason for Rejection" : "Instructions for Resubmission"}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder={
                type === "reject"
                  ? "e.g. Invalid document, does not meet criteria..."
                  : "e.g. Please provide additional information..."
              }
              rows={4}
              className="w-full text-sm p-3 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#2d7a4f] border-border resize-none"
            />
            {reasonError && (
              <p className="text-xs font-semibold text-destructive">{reasonError}</p>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`rounded-xl cursor-pointer ${config.btnClass}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {config.loadingLabel}
              </>
            ) : (
              config.btnLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
