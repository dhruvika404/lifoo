import React from "react";
import { getS3ImageUrl } from "@/lib/s3-utils";
import { X } from "lucide-react";
import type { AuditLog } from "@/services/auditLog.service";

export function formatDate(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year}, ${strHours}:${minutes} ${ampm}`;
}

// ── Smart Summary Generator ───────────────────────────────────────────────────
// Generates a human-readable description when log.message is null (chef logs)

export function generateAuditSummary(log: AuditLog): string {
  if (log.message) return log.message;

  const action = log.action?.toLowerCase() ?? "";
  const resource = log.resourceType?.toLowerCase() ?? "";
  const after = log.afterJsonb ?? {};
  const before = log.beforeJsonb ?? {};
  const data = { ...before, ...after }; // merged for read-only fields

  // ── chef_bank_account ─────────────────────────────────────────────────
  if (resource === "chef_bank_account") {
    if (action === "create") {
      const bank = after.bankName || "Bank";
      const last4 = after.accountNumberLast4;
      return `Added bank account — ${bank}${last4 ? ` (••••${last4})` : ""}`;
    }
    if (action === "update") {
      const changes: string[] = [];
      if (before.bankName !== after.bankName) changes.push(`${before.bankName ?? "—"} → ${after.bankName ?? "—"}`);
      if (before.ifsc !== after.ifsc) changes.push(`IFSC changed`);
      if (before.branch !== after.branch) changes.push(`branch changed`);
      if (before.accountNumberLast4 !== after.accountNumberLast4) changes.push(`account changed`);
      return changes.length > 0 ? `Updated bank account — ${changes.join(", ")}` : "Updated bank account";
    }
    if (action === "set_primary") return "Set bank account as primary";
    if (action === "delete") return `Removed bank account${data.bankName ? ` — ${data.bankName}` : ""}`;
  }

  // ── chef_address ──────────────────────────────────────────────────────
  if (resource === "chef_address") {
    const addrData = Object.keys(after).length > 0 ? after : before;
    const type = (addrData.type ?? "address").replace(/_/g, " ");
    const city = addrData.city ?? "";
    const state = addrData.state ?? "";
    const location = [city, state].filter(Boolean).join(", ");
    if (action === "create") return `Added ${type}${location ? ` — ${location}` : ""}`;
    if (action === "update") {
      const changes: string[] = [];
      if (before.line1 !== after.line1) changes.push("address line");
      if (before.city !== after.city) changes.push("city");
      if (before.pincode !== after.pincode) changes.push("pincode");
      if (before.landmark !== after.landmark) changes.push("landmark");
      return changes.length > 0 ? `Updated ${type} — ${changes.join(", ")} changed` : `Updated ${type}`;
    }
    if (action === "delete") return `Removed ${type}${location ? ` — ${location}` : ""}`;
  }

  // ── chef_document ──────────────────────────────────────────────────────
  if (resource === "chef_document") {
    const docData = Object.keys(after).length > 0 ? after : before;
    const rawDocType = docData.documentType ?? docData.docType ?? "document";
    const docLabel = rawDocType.replace(/_/g, " ");
    if (action === "create") return `Uploaded ${docLabel}`;
    if (action === "update") return `Updated ${docLabel}`;
    if (action === "delete") return `Deleted ${docLabel}`;
  }

  // ── chef_kyc_document ─────────────────────────────────────────────────
  if (resource === "chef_kyc_document") {
    const docData = Object.keys(after).length > 0 ? after : before;
    const kycLabel =
      docData.docType === "aadhaar" ? "Aadhaar Card" :
      docData.docType === "pan"     ? "PAN Card" :
      docData.docType === "gst"     ? "GST Certificate" :
      (docData.docType ?? "KYC document").replace(/_/g, " ");
    if (action === "create")    return `Uploaded ${kycLabel}`;
    if (action === "update")    return `Updated ${kycLabel}`;
    if (action === "approve")   return `Approved ${kycLabel}`;
    if (action === "reject")    return `Rejected ${kycLabel}`;
    if (action === "resubmit")  return `Requested resubmission for ${kycLabel}`;
  }

  // ── chef_profile ──────────────────────────────────────────────────────
  if (resource === "chef_profile") {
    if (action === "create") return "Created chef profile";
    if (action === "update") {
      const changes: string[] = [];
      if (before.displayName !== after.displayName)          changes.push("display name");
      if (before.bio !== after.bio)                          changes.push("bio");
      if (before.gender !== after.gender)                    changes.push("gender");
      if (before.dateOfBirth !== after.dateOfBirth)          changes.push("date of birth");
      if (before.alternatePhone !== after.alternatePhone)    changes.push("alternate phone");
      if (before.experienceYears !== after.experienceYears)  changes.push("experience years");
      if (before.specialization !== after.specialization)    changes.push("specialization");
      if (before.cityId !== after.cityId)                    changes.push("city");
      if (before.referralCode !== after.referralCode)        changes.push("referral code");
      const uBefore = before.user ?? {};
      const uAfter  = after.user  ?? {};
      if (uBefore.preferredLocale !== uAfter.preferredLocale) changes.push("language");
      return changes.length > 0 ? `Updated profile — ${changes.join(", ")}` : "Updated profile";
    }
    if (action === "suspend") return "Chef profile suspended";
    if (action === "restore") return "Chef profile restored";
  }

  // ── generic fallback ──────────────────────────────────────────────────
  const readableAction   = action.replace(/_/g, " ");
  const readableResource = resource.replace(/_/g, " ");
  return `${readableAction} ${readableResource}`;
}

export function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    create: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    delete: "bg-red-500/10 text-red-600 border-red-500/20",
    approve: "bg-green-500/10 text-green-600 border-green-500/20",
    reject: "bg-red-500/10 text-red-600 border-red-500/20",
    resubmit: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    suspend: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    block: "bg-red-500/10 text-red-600 border-red-500/20",
    activate: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    login: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    logout: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    enable: "bg-green-500/10 text-green-600 border-green-500/20",
    disable: "bg-red-500/10 text-red-600 border-red-500/20",
    bulkimport: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    "role.updated": "bg-sky-500/10 text-sky-600 border-sky-500/20",
    set_primary: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    restore: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    passwordchange: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  };
  const cls = map[action?.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold capitalize ${cls}`}
    >
      {action}
    </span>
  );
}

export function ActorTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    admin: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    super_admin: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    system: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    user: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    chef: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  const cls = map[type?.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold capitalize ${cls}`}
    >
      {type?.replace("_", " ")}
    </span>
  );
}

export function ResourceTypePill({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 text-xs font-mono">
      {type?.replace(/_/g, " ")}
    </span>
  );
}

const getImageUrl = (imagePath: string | null) => {
  return getS3ImageUrl(imagePath);
};

function isImageKey(key: string, value: any) {
  if (typeof value !== "string") return false;
  const lowerKey = key.toLowerCase();

  if (lowerKey === "doctype" || lowerKey === "documenttype") return false;

  if (
    lowerKey.includes("image") ||
    lowerKey.includes("icon") ||
    lowerKey.includes("s3path") ||
    lowerKey.includes("doc") ||
    lowerKey.includes("file") ||
    lowerKey.includes("path")
  ) {
    return true;
  }
  if (value.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) return true;
  return false;
}

// ── Bulk Import Viewer ────────────────────────────────────────────────────────

interface BulkImportData {
  totalRows: number;
  successCount: number;
  failedCount: number;
  duplicateCount: number;
  sheetName?: string | null;
  errors?: { row: number; message: string }[];
  duplicates?: { row: number; message: string }[];
}

export function BulkImportViewer({ data }: { data: BulkImportData }) {
  const errors = (data.errors || []).filter((e) => e.message && e.message.trim() !== "");
  const unknownErrors = (data.errors || []).filter((e) => !e.message || e.message.trim() === "");
  const duplicates = data.duplicates || [];

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div>
        <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3">Import Summary</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Total Rows</p>
            <p className="text-xl font-bold text-foreground">{data.totalRows ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
            <p className="text-[11px] text-emerald-600 font-medium uppercase tracking-wide mb-1">Created</p>
            <p className="text-xl font-bold text-emerald-600">{data.successCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-center">
            <p className="text-[11px] text-red-500 font-medium uppercase tracking-wide mb-1">Failed</p>
            <p className="text-xl font-bold text-red-500">{data.failedCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-center">
            <p className="text-[11px] text-amber-600 font-medium uppercase tracking-wide mb-1">Duplicates</p>
            <p className="text-xl font-bold text-amber-600">{data.duplicateCount ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Errors with messages */}
      {errors.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-red-500/15 text-red-500 text-[10px] flex items-center justify-center font-bold">✕</span>
            Validation Errors ({errors.length})
          </h4>
          <div className="space-y-1.5 max-h-[28vh] overflow-y-auto pr-1">
            {errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <span className="mt-0.5 text-[10px] font-bold text-red-400 bg-red-500/10 rounded px-1.5 py-0.5 shrink-0 font-mono">
                  Row {e.row}
                </span>
                <p className="text-xs text-red-600 leading-relaxed">{e.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unknown / blank error rows */}
      {unknownErrors.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Unknown Errors (rows with no message)
          </h4>
          <div className="flex flex-wrap gap-2">
            {unknownErrors.map((e, i) => (
              <span key={i} className="text-[11px] font-mono bg-muted border border-border/60 rounded px-2 py-0.5 text-muted-foreground">
                Row {e.row}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Duplicates */}
      {duplicates.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] flex items-center justify-center font-bold">⚠</span>
            Duplicates ({duplicates.length})
          </h4>
          <div className="space-y-1.5 max-h-[20vh] overflow-y-auto pr-1">
            {duplicates.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <span className="mt-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5 shrink-0 font-mono">
                  Row {d.row}
                </span>
                <p className="text-xs text-amber-700 leading-relaxed">{d.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── JsonDataViewer — for create/delete actions ───────────────────────────────

const SKIP_KEYS = [
  "id",
  "chefId",
  "adminId",
  "userId",
  "resourceId",
  "reviewedByAdminId",
  "digioDocId",
  "documentNumberEncrypted",
  "accountNumberEncrypted",
];

export function JsonDataViewer({
  title,
  data,
  variant = "neutral",
}: {
  title: string;
  data: Record<string, any>;
  variant?: "success" | "danger" | "neutral";
}) {
  const borderColor =
    variant === "success"
      ? "border-emerald-500/30"
      : variant === "danger"
      ? "border-red-500/30"
      : "border-border/60";

  const headingColor =
    variant === "success"
      ? "text-emerald-600"
      : variant === "danger"
      ? "text-red-500"
      : "text-foreground";

  const entries = Object.entries(data).filter(([key]) => !SKIP_KEYS.includes(key));

  const renderVal = (key: string, val: any): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;
    if (isImageKey(key, val)) {
      return <img src={getImageUrl(val) || ""} alt={key} className="h-14 w-14 object-cover rounded-md border shadow-sm mt-1" />;
    }
    if (typeof val === "string" && (key.toLowerCase().includes("date") || key.toLowerCase().endsWith("at"))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return <span>{formatDate(val)}</span>;
    }
    if (typeof val === "boolean") return <span className={val ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>{val ? "Yes" : "No"}</span>;
    if (typeof val === "object") return <pre className="text-[10px] bg-background p-1.5 rounded border border-border/50 whitespace-pre-wrap break-all">{JSON.stringify(val, null, 2)}</pre>;
    return <span>{String(val)}</span>;
  };

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold border-b pb-2 ${headingColor}`}>{title}</h3>
      <div className={`space-y-1.5 max-h-[40vh] overflow-y-auto pr-1`}>
        {entries.map(([key, val]) => (
          <div key={key} className={`grid grid-cols-[140px_1fr] gap-3 p-2 rounded-lg border ${borderColor} bg-muted/20 items-start`}>
            <span className="text-[11px] font-mono font-medium text-foreground truncate pt-0.5" title={key}>{key}</span>
            <span className="text-xs text-foreground/80 break-all">{renderVal(key, val)}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No data available</p>
        )}
      </div>
    </div>
  );
}

export function DiffViewer({ before, after }: { before: any; after: any }) {
  const isObject = (val: any) => val !== null && typeof val === "object" && !Array.isArray(val);

  if (!isObject(before) && !isObject(after)) {
    const isChanged = before !== after;
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b pb-2">Changes</h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wide">
          <div>Before</div>
          <div>After</div>
        </div>
        <div className={`grid grid-cols-2 gap-4 p-2 rounded-lg items-start transition-colors ${isChanged ? "bg-muted/40 border border-border/40" : ""}`}>
          <div className={`text-xs break-all pt-1 ${isChanged && before !== undefined ? "text-red-500/80" : "text-muted-foreground"}`}>
            {before !== undefined && before !== null ? String(before) : <span className="text-muted-foreground">—</span>}
          </div>
          <div className={`text-xs break-all pt-1 ${isChanged && after !== undefined ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>
            {after !== undefined && after !== null ? String(after) : <span className="text-muted-foreground">—</span>}
          </div>
        </div>
      </div>
    );
  }

  const b = isObject(before) ? before : {};
  const a = isObject(after) ? after : {};
  const allKeys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).sort((k1, k2) => {
    const isImage1 = isImageKey(k1, b[k1]) || isImageKey(k1, a[k1]);
    const isImage2 = isImageKey(k2, b[k2]) || isImageKey(k2, a[k2]);
    if (isImage1 && !isImage2) return 1;
    if (!isImage1 && isImage2) return -1;
    return k1.localeCompare(k2);
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2">Changes</h3>
      <div className="grid grid-cols-[1fr_2fr_2fr] gap-4 text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wide">
        <div>Field</div>
        <div>Before</div>
        <div>After</div>
      </div>
      <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-2">
        {allKeys.map((key) => {
          if (
            [
              "id",
              "chefId",
              "adminId",
              "userId",
              "resourceId",
              "reviewedByAdminId",
              "verifiedAt",
              "expiresAt",
              "digioDocId",
              "documentNumberEncrypted",
              "accountNumberEncrypted",
            ].includes(key)
          )
            return null;

          const valB = b[key];
          const valA = a[key];
          const isChanged = JSON.stringify(valB) !== JSON.stringify(valA);

          const renderValue = (val: any, fieldKey: string) => {
            if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;
            if (isImageKey(fieldKey, val)) {
              return (
                <div className="mt-1 mb-1">
                  <img src={getImageUrl(val) || ""} alt={fieldKey} className="h-16 w-16 object-cover rounded-md border shadow-sm" />
                </div>
              );
            }
            if (typeof val === "string" && (fieldKey.toLowerCase().includes("date") || fieldKey.toLowerCase().endsWith("at"))) {
              const d = new Date(val);
              if (!isNaN(d.getTime())) {
                return <span>{formatDate(val)}</span>;
              }
            }
            if (typeof val === "object") return <pre className="text-[10px] bg-background p-1.5 rounded border border-border/50">{JSON.stringify(val, null, 2)}</pre>;
            return <span>{String(val)}</span>;
          };

          return (
            <div key={key} className={`grid grid-cols-[1fr_2fr_2fr] gap-4 p-2 rounded-lg items-start transition-colors ${isChanged ? "bg-muted/40 border border-border/40" : ""}`}>
              <div className="text-[11px] font-mono font-medium text-foreground pt-1 truncate" title={key}>
                {key}
              </div>
              <div className={`text-xs break-all pt-1 ${isChanged && valB !== undefined ? "text-red-500/80" : "text-muted-foreground"}`}>
                {valB !== undefined ? renderValue(valB, key) : <span className="text-muted-foreground">—</span>}
              </div>
              <div className={`text-xs break-all pt-1 ${isChanged && valA !== undefined ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>
                {valA !== undefined ? renderValue(valA, key) : <span className="text-muted-foreground">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuditLogDetailModal({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  const action = log.action?.toLowerCase();
  const isBulkImport = action === "bulkimport";
  const isCreate = action === "create";
  const isDelete = action === "delete";
  const isDiff = [
    "update",
    "approve",
    "reject",
    "resubmit",
    "suspend",
    "block",
    "restore",
    "enable",
    "disable",
    "set_primary",
    "role.updated",
  ].includes(action);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Audit Log Detail</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary banner — always visible */}
        <div className="mb-5 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
          <p className="text-[11px] text-muted-foreground font-medium mb-1 uppercase tracking-wide">
            {log.message ? "Message" : "Summary"}
          </p>
          <p className="text-sm text-foreground font-medium leading-relaxed">
            {generateAuditSummary(log)}
          </p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">Actor</p>
            <p className="font-semibold text-foreground">{log.actorName || "—"}</p>
            {log.actorEmail && (
              <p className="text-xs text-muted-foreground">{log.actorEmail}</p>
            )}
            <div className="mt-1.5 flex gap-2">
              <ActorTypeBadge type={log.actorType} />
            </div>
          </div>
          {/* Only show Target User if it's different from the actor */}
          {log.targetUserName && log.targetUserName !== log.actorName ? (
            <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Target User</p>
              <p className="font-semibold text-foreground">{log.targetUserName}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Resource</p>
              <ResourceTypePill type={log.resourceType} />
            </div>
          )}
          <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">Action</p>
            <ActionBadge action={log.action} />
          </div>
          {/* Show Resource only if it wasn't used in the top-right slot */}
          {log.targetUserName && log.targetUserName !== log.actorName && (
            <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Resource</p>
              <ResourceTypePill type={log.resourceType} />
            </div>
          )}
          <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">IP Address</p>
            <p className="text-sm font-mono text-foreground">{log.ip}</p>
          </div>
          <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">Occurred At</p>
            <p className="text-sm text-foreground">{formatDate(log.occurredAt)}</p>
          </div>
          <div className="col-span-2 rounded-lg bg-muted/50 border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">User Agent</p>
            <p className="text-[11px] font-mono text-muted-foreground break-all">{log.userAgent || "—"}</p>
          </div>
        </div>

        {/* ── Action-based detail section ─────────────────────────────────── */}

        {/* Bulk Import */}
        {isBulkImport && log.afterJsonb && (
          <BulkImportViewer data={log.afterJsonb as BulkImportData} />
        )}

        {/* Create — show what was created */}
        {isCreate && log.afterJsonb && (
          <JsonDataViewer title="Created Data" data={log.afterJsonb} variant="success" />
        )}

        {/* Delete — show what was deleted */}
        {isDelete && log.beforeJsonb && (
          <JsonDataViewer title="Deleted Data" data={log.beforeJsonb} variant="danger" />
        )}

        {/* Update / Approve / Reject / Resubmit / Status-change actions — show diff */}
        {isDiff && (log.beforeJsonb || log.afterJsonb) && (
          <DiffViewer before={log.beforeJsonb} after={log.afterJsonb} />
        )}
      </div>
    </div>
  );
}
