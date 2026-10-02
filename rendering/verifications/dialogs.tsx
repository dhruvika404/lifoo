"use client";

import {
  CheckCircle2,
  X,
  RotateCcw,
  FileText,
  Lock,
  Download,
  Check,
  Loader2,
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
import { DocumentPreviewVisualizer } from "./documentPreview";
import type { VerificationItem } from "./types";
import type {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
} from "react-hook-form";
import toast from "react-hot-toast";

export interface RejectFormValues {
  reason: string;
}

export interface ResubmitFormValues {
  documents: string[];
  reason: string;
}

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChef: VerificationItem | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function ApproveDialog({
  open,
  onOpenChange,
  selectedChef,
  isSubmitting,
  onConfirm,
}: ApproveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Approve Verifications
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Are you sure you want to approve the compliance verification for{" "}
            <span className="font-semibold text-foreground">{selectedChef?.name}</span>?
            Once approved, the chef will be marked as compliant.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-xl cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Approving...
              </>
            ) : (
              "Confirm Approval"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChef: VerificationItem | null;
  isSubmitting: boolean;
  register: UseFormRegister<RejectFormValues>;
  handleSubmit: UseFormHandleSubmit<RejectFormValues>;
  errors: FieldErrors<RejectFormValues>;
  onSubmit: (data: RejectFormValues) => void;
}

export function RejectDialog({
  open,
  onOpenChange,
  selectedChef,
  isSubmitting,
  register,
  handleSubmit,
  errors,
  onSubmit,
}: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
            <X className="h-5 w-5 rounded-full bg-red-100 p-0.5 text-destructive" />
            Reject Verification
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm text-muted-foreground">
            Specify the reason for rejecting{" "}
            <span className="font-semibold text-foreground">{selectedChef?.name}</span>
            &apos;s verification. The chef will be notified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 py-3">
            <label
              htmlFor="verification-reject-reason"
              className="text-xs font-bold text-foreground uppercase tracking-wider block"
            >
              Reason for Rejection
            </label>
            <textarea
              id="verification-reject-reason"
              {...register("reason")}
              placeholder="e.g. FSSAI License is expired, PAN card photo is blurred, or address proof is invalid."
              rows={4}
              className="w-full text-sm p-3 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#2d7a4f] border-border"
            />
            {errors.reason && (
              <p className="text-xs font-semibold text-destructive mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                "Reject Verification"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ResubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChef: VerificationItem | null;
  isSubmitting: boolean;
  selectedDocs: string[];
  resubmitReason: string;
  resubmitError: string;
  onToggleDoc: (doc: string) => void;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export function ResubmitDialog({
  open,
  onOpenChange,
  selectedChef,
  isSubmitting,
  selectedDocs,
  resubmitReason,
  resubmitError,
  onToggleDoc,
  onReasonChange,
  onConfirm,
}: ResubmitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
            <RotateCcw className="h-5 w-5 text-amber-600" />
            Request Document Resubmission
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm text-muted-foreground">
            Select which specific documents require correction or re-upload by{" "}
            <span className="font-semibold text-foreground">{selectedChef?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
              Select Documents to Flag
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {selectedChef?.documents.map((doc: string) => {
                const isChecked = selectedDocs.includes(doc);
                return (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => onToggleDoc(doc)}
                    className={`flex items-center justify-between p-3 border rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isChecked
                        ? "bg-amber-50/50 border-amber-400 text-amber-800 shadow-inner"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{doc}</span>
                    {isChecked && (
                      <div className="h-4 w-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="resubmit-instructions"
              className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2"
            >
              Instructions for Resubmission
            </label>
            <textarea
              id="resubmit-instructions"
              value={resubmitReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Provide clear instructions for the chef on what needs to be fixed..."
              rows={3}
              className="w-full text-sm p-3 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#2d7a4f] border-border"
            />
          </div>

          {resubmitError && (
            <p className="text-xs font-semibold text-destructive">{resubmitError}</p>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Request...
              </>
            ) : (
              "Request Resubmission"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDoc: { chef: VerificationItem; docType: string } | null;
  onApprove: (chef: VerificationItem) => void;
  onReject: (chef: VerificationItem) => void;
  onResubmit: (chef: VerificationItem) => void;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  selectedDoc,
  onApprove,
  onReject,
  onResubmit,
}: DocumentPreviewDialogProps) {
  if (!selectedDoc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl overflow-hidden bg-background">
        <DialogHeader className="border-b pb-3 px-1">
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
            <FileText className="h-5 w-5 text-[#2d7a4f]" />
            Document Preview: {selectedDoc.docType}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Verifying compliance credentials for {selectedDoc.chef.name} (Owner:{" "}
            {selectedDoc.chef.owner})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-1 flex justify-center">
          <DocumentPreviewVisualizer
            docType={selectedDoc.docType}
            chef={selectedDoc.chef}
          />
        </div>

        <DialogFooter className="border-t pt-3 px-1 flex flex-col sm:flex-row items-center justify-between sm:justify-between gap-3 w-full">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Secure encrypted viewing
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success(`Downloading ${selectedDoc.docType} document...`);
              }}
              className="flex items-center gap-1 rounded-xl text-xs font-semibold h-8 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download Original
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onApprove(selectedDoc.chef);
              }}
              className="bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-xl text-xs font-semibold h-8 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
