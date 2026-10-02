import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getS3ImageUrl } from "@/lib/s3-utils";

export const getDocumentUrl = (path: string | null) => {
  return getS3ImageUrl(path);
};

export const getStatusColor = (status: any) => {
  if (typeof status === "boolean") {
    return status ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
  if (status === 100 || status === "100") {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  if (!status) return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  const s = String(status).toLowerCase();
  if (["active", "verified", "approved", "uploaded", "completed"].includes(s) || s.includes("completed")) {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  if (["pending", "submitted", "under review", "draft"].includes(s)) {
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
  if (["suspended", "blocked", "rejected", "inactive", "failed"].includes(s)) {
    return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  }
  return "bg-slate-500/10 text-slate-600 border-slate-500/20";
};

export const getStatusIcon = (status: any, className = "h-4 w-4") => {
  if (typeof status === "boolean") {
    return status ? <CheckCircle2 className={`${className} text-emerald-500 shrink-0`} /> : <AlertTriangle className={`${className} text-amber-500 shrink-0`} />;
  }
  if (status === 100 || status === "100") {
    return <CheckCircle2 className={`${className} text-emerald-500 shrink-0`} />;
  }
  if (!status) return <AlertTriangle className={`${className} text-amber-500 shrink-0`} />;
  const s = String(status).toLowerCase();
  if (["active", "verified", "approved", "uploaded", "completed"].includes(s) || s.includes("completed")) {
    return <CheckCircle2 className={`${className} text-emerald-500 shrink-0`} />;
  }
  if (["pending", "submitted", "under review", "draft"].includes(s)) {
    return <AlertTriangle className={`${className} text-amber-500 shrink-0`} />;
  }
  return <XCircle className={`${className} text-rose-500 shrink-0`} />;
};

export const isStepCompleted = (status: any) => {
  if (typeof status === "boolean") return status;
  if (status === 100 || status === "100") return true;
  if (!status) return false;
  const s = String(status).toLowerCase();
  return s.includes("completed") || s.includes("verified") || s.includes("approved") || s === "active";
};

export const formatStepKey = (key: string) => {
  const mapping: Record<string, string> = {
    personalInfoCompleted: "Personal Info",
    residentialAddressCompleted: "Residential Address",
    bankAccountAdded: "Bank Details",
    hasProducts: "Menu Products",
    aadhaar: "Aadhaar",
    pan: "PAN",
    fssai: "FSSAI License",
    addressProof: "Address Proof",
    kitchenPhoto: "Kitchen Photo",
    kitchenHygieneVideo: "Kitchen Video",
    profilePhoto: "Profile Photo",
    bankProof: "Bank Proof"
  };
  return mapping[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => String(str).toUpperCase());
};

export const formatStepStatus = (status: any, key?: string) => {
  if (typeof status === "boolean") {
    if (key === "hasProducts") return status ? "Approved" : "Pending";
    return status ? "Completed" : "Pending";
  }
  if (status === 100 || status === "100") return "100%";
  if (!status) return "Pending";
  const clean = String(status).replace(/_/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

export const formatDocType = (type: string) => {
  const map: Record<string, string> = {
    fssai: "FSSAI License",
    pan: "PAN Card",
    aadhaar: "Aadhaar Card",
    kitchen_photo: "Kitchen Photo",
    kitchen_hygiene_video: "Kitchen Video",
    profile_photo: "Profile Photo",
    bank_proof: "Bank Proof",
    address_proof: "Address Proof"
  };
  return map[type.toLowerCase()] || type.replace(/_/g, " ").toUpperCase();
};

export const formatLocale = (locale?: string | null) => {
  if (!locale) return "Not Specified";
  const locales: Record<string, string> = {
    en: "English (en)",
    hi: "Hindi (hi)",
    ta: "Tamil (ta)",
    te: "Telugu (te)",
    kn: "Kannada (kn)",
    ml: "Malayalam (ml)",
    gu: "Gujarati (gu)",
    mr: "Marathi (mr)"
  };
  return locales[locale.toLowerCase()] || locale.toUpperCase();
};
