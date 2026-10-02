"use client";

import { useState, useMemo } from "react";
import { getS3ImageUrl } from "@/lib/s3-utils";
import {
  AlertCircle,
  Check,
  RotateCcw,
  X,
  Eye,
  FileText,
  Lock,
  Building2,
  Phone,
  ExternalLink,
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
import type {
  DocumentVerificationItem,
  ChefDocument,
  ReviewPayload,
} from "@/services/verification.service";
import { ReviewDialog } from "@/components/reviewDialog";

interface DocumentsTabProps {
  documents: DocumentVerificationItem[];
  isReviewing: boolean;
  onReview: (id: string, payload: ReviewPayload) => Promise<void>;
  statusFilter?: string;
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

const DOC_TYPE_LABEL: Record<string, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN",
  fssai: "FSSAI",
  bank_proof: "Bank Proof",
  kitchen_photo: "Kitchen Photo",
  profile_photo: "Profile Photo",
  kitchen_hygiene_video: "Kitchen Video",
  partner_agreement: "Agreement",
  address_proof: "address proof",
};

function getImageUrl(s3Path: string) {
  return getS3ImageUrl(s3Path) || "";
}

function isVideoFile(s3Path: string) {
  return s3Path.includes("/videos/") || /\.(mp4|mov|webm)$/i.test(s3Path);
}

function chefOverallStatus(docs: ChefDocument[]) {
  if (docs.some((d) => d.status === "rejected")) return "rejected";
  if (docs.every((d) => d.status === "approved")) return "approved";
  if (docs.some((d) => d.status === "resubmission")) return "resubmission";
  return "pending";
}

function PreviewModal({
  doc,
  chef,
  isReviewing,
  onClose,
  onAction,
  children,
}: {
  doc: ChefDocument | null;
  chef: DocumentVerificationItem | null;
  isReviewing: boolean;
  onClose: () => void;
  onAction: (type: "approve" | "reject" | "resubmit") => void;
  children?: React.ReactNode;
}) {
  const [imgErr, setImgErr] = useState(false);
  if (!doc || !chef) return null;

  const docLabel = DOC_TYPE_LABEL[doc.docType] || doc.docType.replace(/_/g, " ");
  const mediaUrl = doc.s3Path ? getImageUrl(doc.s3Path) : null;
  const isVid = doc.s3Path ? isVideoFile(doc.s3Path) : false;
  const status = (doc.status || "pending").toLowerCase();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl rounded-2xl overflow-hidden bg-background p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 border-b flex flex-col gap-1 text-left sm:text-left">
          <div className="flex items-center gap-2 pr-8 flex-wrap">
            <FileText className="h-5 w-5 text-[#2d7a4f] shrink-0" />
            <DialogTitle className="text-foreground font-bold text-lg leading-tight">
              Document: {docLabel}
            </DialogTitle>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border shrink-0 ${STATUS_BADGE[status] || STATUS_BADGE.pending
                }`}
            >
              {STATUS_LABEL[status] || status}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pl-7">
            Verifying credentials for <span className="font-semibold text-foreground">{chef.displayName}</span> ({chef.businessName || "Chef"})
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="w-full aspect-video bg-black/90 rounded-xl overflow-hidden flex items-center justify-center border border-border">
            {mediaUrl && !imgErr ? (
              isVid ? (
                <video src={mediaUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img
                  src={mediaUrl}
                  alt={docLabel}
                  className="w-full h-full object-contain"
                  onError={() => setImgErr(true)}
                />
              )
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <FileText className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm font-semibold">Media Document Unavailable</p>
                {doc.s3Path && <p className="text-xs font-mono text-slate-500 break-all">{doc.s3Path}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-secondary/30 p-3 rounded-xl border border-border/50">
            <div>
              <p className="text-muted-foreground">Uploaded At</p>
              <p className="font-semibold text-foreground mt-0.5">
                {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            {doc.expiresAt && (
              <div>
                <p className="text-muted-foreground">Expires At</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {new Date(doc.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {doc.rejectionReason && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
              <p className="font-bold">Rejection Reason:</p>
              <p className="mt-0.5">{doc.rejectionReason}</p>
            </div>
          )}

          {mediaUrl && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure encrypted storage
              </span>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d7a4f] hover:underline"
              >
                Open Original File <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-secondary/10 flex flex-row items-center justify-end gap-2 w-full">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onAction("approve")}
              disabled={isReviewing || status === "approved" || status === "active"}
              className="flex items-center gap-1 h-9 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-xl text-xs font-semibold transition-all px-4 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction("resubmit")}
              disabled={isReviewing || status === "approved" || status === "active"}
              className="flex items-center gap-1 h-9 border border-border bg-card hover:bg-accent text-foreground rounded-xl text-xs font-semibold transition-all px-4 shadow-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Resubmit
            </Button>
            <Button
              onClick={() => onAction("reject")}
              disabled={isReviewing || status === "rejected" || status === "approved" || status === "active"}
              className="flex items-center gap-1 h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all px-4 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </DialogFooter>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function DocumentsTab({
  documents,
  isReviewing,
  onReview,
  statusFilter = "all",
}: DocumentsTabProps) {
  const [previewDoc, setPreviewDoc] = useState<ChefDocument | null>(null);
  const [previewChef, setPreviewChef] = useState<DocumentVerificationItem | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewDialogType, setReviewDialogType] = useState<"approve" | "reject" | "resubmit">("approve");

  const filteredChefs = useMemo(
    () =>
      documents
        .map((chef) => ({
          ...chef,
          documents:
            statusFilter !== "all"
              ? chef.documents.filter((d) => d.status === statusFilter)
              : chef.documents,
        })),
    [documents, statusFilter]
  );

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No document verifications found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No submissions match the current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredChefs.map((chef) => {
          if (chef.documents.length === 0) {
            return (
              <div
                key={chef.chefId || Math.random().toString()}
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
                  <FileText className="h-5 w-5 mb-1 opacity-50" />
                  No documents uploaded
                </div>
              </div>
            );
          }

          const overall = chefOverallStatus(chef.documents);
          const cardBorder =
            overall === "approved"
              ? "border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/5"
              : overall === "rejected"
                ? "border-destructive/30 hover:border-destructive/50"
                : overall === "resubmission"
                  ? "border-amber-500/30 hover:border-amber-500/50"
                  : "border-border hover:shadow-md hover:border-slate-300";

          return (
            <div
              key={chef.chefId}
              className={`bg-card rounded-xl border p-4 flex flex-col justify-between shadow-xs transition-all duration-300 ${cardBorder}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-snug truncate">
                    {chef.displayName || "—"}
                  </h3>
                  {chef.businessName && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {chef.businessName}
                    </p>
                  )}
                  {chef.phone && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" />
                      {chef.phone}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${STATUS_BADGE[overall] || STATUS_BADGE.pending
                    }`}
                >
                  {STATUS_LABEL[overall] || overall}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {chef.documents.map((doc) => {
                  const isRej = doc.status === "rejected";
                  const isReq = doc.status === "resubmission";
                  const isApp = doc.status === "approved";
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setPreviewDoc(doc);
                        setPreviewChef(chef);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-2xs ${isRej
                        ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100/80"
                        : isReq
                          ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100/80"
                          : isApp
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80"
                            : "bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      <Eye
                        className={`h-3.5 w-3.5 ${isRej
                          ? "text-red-600"
                          : isReq
                            ? "text-amber-600"
                            : isApp
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                      />
                      {DOC_TYPE_LABEL[doc.docType] || doc.docType.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <PreviewModal
        doc={previewDoc}
        chef={previewChef}
        isReviewing={isReviewing}
        onClose={() => {
          setPreviewDoc(null);
          setPreviewChef(null);
        }}
        onAction={(type) => {
          setReviewDialogType(type);
          setReviewDialogOpen(true);
        }}
      >
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          type={reviewDialogType}
          itemName={previewDoc ? (DOC_TYPE_LABEL[previewDoc.docType] || previewDoc.docType.replace(/_/g, " ")) : "document"}
          isSubmitting={isReviewing}
          onConfirm={async (payload) => {
            if (!previewDoc) return;
            await onReview(previewDoc.id, payload);
            setReviewDialogOpen(false);
            setPreviewDoc(null);
            setPreviewChef(null);
          }}
        />
      </PreviewModal>
    </>
  );
}