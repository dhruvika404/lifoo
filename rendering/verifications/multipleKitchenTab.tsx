"use client";

import React, { useState } from "react";
import { getS3ImageUrl } from "@/lib/s3-utils";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Check,
  X,
  RotateCcw,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Eye,
  Compass,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/tablePagination";
import { ReviewDialog } from "@/components/reviewDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type {
  KitchenAddressItem,
  KitchenAddressDetails,
  ChefDocument,
  ReviewPayload,
} from "@/services/verification.service";

interface MultipleKitchenTabProps {
  kitchenAddresses: KitchenAddressItem[];
  isLoading: boolean;
  isReviewing: boolean;
  totalItems: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
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

const DOC_TYPE_LABEL: Record<string, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN",
  fssai: "FSSAI",
  bank_proof: "Bank Proof",
  kitchen_photo: "Kitchen Photo",
  profile_photo: "Profile Photo",
  kitchen_hygiene_video: "Kitchen Video",
  address_proof: "address proof",
};

function getImageUrl(s3Path: string) {
  return getS3ImageUrl(s3Path) || "";
}

function isVideoFile(s3Path: string) {
  return s3Path.includes("/videos/") || /\.(mp4|mov|webm)$/i.test(s3Path);
}

function getAddressObject(item: KitchenAddressItem): KitchenAddressDetails | null {
  if (typeof item.address === "object" && item.address !== null) {
    return item.address as KitchenAddressDetails;
  }
  return null;
}

function getKitchenStatus(item: KitchenAddressItem): string {
  const addrObj = getAddressObject(item);
  const status = addrObj?.approvalStatus || item.approvalStatus || item.status || "pending";
  return status.toLowerCase();
}

function DocumentViewModal({
  doc,
  kitchenItem,
  isReviewing,
  onClose,
  onApprove,
  onResubmit,
  onReject,
}: {
  doc: ChefDocument | null;
  kitchenItem: KitchenAddressItem | null;
  isReviewing: boolean;
  onClose: () => void;
  onApprove: (id: string, name: string) => void;
  onResubmit: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  if (!doc || !kitchenItem) return null;

  const docLabel = DOC_TYPE_LABEL[doc.docType] || doc.docType.replace(/_/g, " ");
  const kitchenName = kitchenItem.businessName || kitchenItem.kitchenName || "Kitchen Branch";
  const chefName = kitchenItem.displayName || kitchenItem.chefName || "Chef";
  const mediaUrl = doc.s3Path ? getImageUrl(doc.s3Path) : null;
  const isVid = doc.s3Path ? isVideoFile(doc.s3Path) : false;
  const status = (doc.status || "pending").toLowerCase();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl overflow-hidden bg-background p-0">
        {/* Header */}
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
            {kitchenName} — Chef: <span className="font-semibold text-foreground">{chefName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Media Preview Body */}
        <div className="p-4 space-y-4">
          <div className="w-full aspect-video bg-black/90 rounded-xl overflow-hidden flex items-center justify-center border border-border">
            {mediaUrl && !imgErr ? (
              isVid ? (
                <video src={mediaUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img
                  src={mediaUrl}
                  alt={docLabel}
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-contain"
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

          {/* Document Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-secondary/30 p-3 rounded-xl border border-border/50">
            <div>
              <p className="text-muted-foreground">Document Type</p>
              <p className="font-semibold text-foreground mt-0.5 capitalize">{docLabel}</p>
            </div>
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

        {/* Action Buttons in Modal */}
        <DialogFooter className="p-4 border-t bg-secondary/10 flex flex-row items-center justify-between gap-2 sm:justify-between w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold h-9 cursor-pointer"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                onClose();
                onApprove(kitchenItem.id, `${kitchenName} (${docLabel})`);
              }}
              disabled={isReviewing || status === "approved" || status === "active"}
              className="flex items-center gap-1 h-9 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-xl text-xs font-semibold transition-all px-4 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onResubmit(kitchenItem.id, `${kitchenName} (${docLabel})`);
              }}
              disabled={isReviewing || status === "approved" || status === "active"}
              className="flex items-center gap-1 h-9 border border-border bg-card hover:bg-accent text-foreground rounded-xl text-xs font-semibold transition-all px-4 shadow-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Resubmit
            </Button>
            <Button
              onClick={() => {
                onClose();
                onReject(kitchenItem.id, `${kitchenName} (${docLabel})`);
              }}
              disabled={isReviewing || status === "rejected" || status === "approved" || status === "active"}
              className="flex items-center gap-1 h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all px-4 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MultipleKitchenTab({
  kitchenAddresses,
  isLoading,
  isReviewing,
  totalItems,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onReview,
}: MultipleKitchenTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject" | "resubmit">("approve");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const [activeDoc, setActiveDoc] = useState<ChefDocument | null>(null);
  const [activeKitchenItem, setActiveKitchenItem] = useState<KitchenAddressItem | null>(null);

  const openDialog = (
    type: "approve" | "reject" | "resubmit",
    id: string,
    chefOrKitchenName: string
  ) => {
    setDialogType(type);
    setSelectedId(id);
    setSelectedName(chefOrKitchenName);
    setDialogOpen(true);
  };

  const handleConfirm = async (payload: ReviewPayload) => {
    if (!selectedId) return;
    await onReview(selectedId, payload);
    setDialogOpen(false);
  };

  const totalPages = Math.ceil(totalItems / limit) || 1;

  if (kitchenAddresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg text-foreground">No kitchen addresses found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search query or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kitchenAddresses.map((item) => {
          const addrObj = getAddressObject(item);
          const status = getKitchenStatus(item);
          const chefName = item.displayName || item.chefName || item.businessName || "Chef";
          const kitchenName = item.businessName || item.kitchenName || "Kitchen Branch";

          const line1 = addrObj?.line1 ?? item.line1;
          const line2 = addrObj?.line2 ?? item.line2;
          const landmark = addrObj?.landmark ?? item.landmark;
          const city = addrObj?.city ?? item.city;
          const state = addrObj?.state ?? item.state;
          const pincode = addrObj?.pincode ?? item.pincode;
          const country = addrObj?.country ?? item.country;
          const createdAt = addrObj?.createdAt ?? item.createdAt;
          const rejectionReason = addrObj?.rejectionReason ?? item.rejectionReason;

          const latitude = addrObj?.latitude;
          const longitude = addrObj?.longitude;

          const fullAddr =
            [line1, line2, landmark].filter(Boolean).join(", ") ||
            (typeof item.address === "string" ? item.address : "");
          const locationStr = [city, state, pincode].filter(Boolean).join(", ");

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
              key={item.id}
              className={`bg-card rounded-xl border p-4 flex flex-col justify-between gap-3 shadow-xs transition-all duration-300 ${cardBorder}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground leading-snug truncate flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-[#2d7a4f] shrink-0" />
                      {kitchenName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      Chef: <span className="font-semibold text-foreground">{chefName}</span>
                    </p>
                    {createdAt && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border shrink-0 ${STATUS_BADGE[status] || STATUS_BADGE.pending
                      }`}
                  >
                    {STATUS_LABEL[status] || status}
                  </span>
                </div>

                {/* Address & Contact Details Box */}
                <div className="text-[11px] text-muted-foreground bg-secondary/30 rounded-md p-2.5 space-y-1.5">
                  {fullAddr && (
                    <p className="text-foreground font-medium flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{fullAddr}</span>
                    </p>
                  )}
                  {locationStr && (
                    <p className="text-muted-foreground pl-4">
                      {locationStr} {country ? `• ${country}` : ""}
                    </p>
                  )}
                  {latitude != null && longitude != null && (
                    <p className="text-muted-foreground pl-4 flex items-center gap-1 text-[10px]">
                      <Compass className="h-3 w-3 text-[#2d7a4f]" />
                      <span>
                        Coords: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </span>
                    </p>
                  )}
                  {(item.phone || item.email) && (
                    <div className="pt-1 border-t border-border/50 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                      {item.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {item.phone}
                        </span>
                      )}
                      {item.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {item.email}
                        </span>
                      )}
                    </div>
                  )}
                  {rejectionReason && (
                    <p className="pt-1 border-t border-border/50 text-destructive font-medium">
                      Rejection Reason: {rejectionReason}
                    </p>
                  )}
                </div>

                {/* Document Pills Section (Matching Documents Tab design) */}
                {item.documents && item.documents.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">Uploaded Documents:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.documents.map((doc) => {
                        const isRej = doc.status === "rejected";
                        const isReq = doc.status === "resubmission";
                        const isApp = doc.status === "approved";
                        const docLabel =
                          DOC_TYPE_LABEL[doc.docType] || doc.docType.replace(/_/g, " ");

                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setActiveDoc(doc);
                              setActiveKitchenItem(item);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-2xs ${isRej
                                ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                                : isReq
                                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                                  : isApp
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                    : "bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                          >
                            <Eye
                              className={`h-3.5 w-3.5 shrink-0 ${isRej
                                  ? "text-red-600"
                                  : isReq
                                    ? "text-amber-600"
                                    : isApp
                                      ? "text-emerald-600"
                                      : "text-muted-foreground"
                                }`}
                            />
                            <span>{docLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-2">
                <Button
                  onClick={() => openDialog("approve", item.id, kitchenName)}
                  disabled={isReviewing || status === "approved" || status === "active"}
                  className="flex items-center justify-center gap-1 h-8 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-lg text-[11px] font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openDialog("resubmit", item.id, kitchenName)}
                  disabled={isReviewing || status === "approved" || status === "active"}
                  className="flex items-center justify-center gap-1 h-8 border border-border bg-card hover:bg-accent text-foreground rounded-lg text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3 text-muted-foreground" /> Resubmit
                </Button>
                <Button
                  onClick={() => openDialog("reject", item.id, kitchenName)}
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

      {/* Pagination Bar */}
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        totalItems={totalItems}
      />

      <ReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        itemName={selectedName}
        isSubmitting={isReviewing}
        onConfirm={handleConfirm}
      />

      {activeDoc && activeKitchenItem && (
        <DocumentViewModal
          doc={activeDoc}
          kitchenItem={activeKitchenItem}
          isReviewing={isReviewing}
          onClose={() => {
            setActiveDoc(null);
            setActiveKitchenItem(null);
          }}
          onApprove={(id, name) => openDialog("approve", id, name)}
          onResubmit={(id, name) => openDialog("resubmit", id, name)}
          onReject={(id, name) => openDialog("reject", id, name)}
        />
      )}
    </div>
  );
}
