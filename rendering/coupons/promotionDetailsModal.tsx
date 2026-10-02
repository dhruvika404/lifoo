"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { promotionService, Promotion } from "@/services/promotion.service";
import {
  Loader2,
  Calendar,
  Copy,
  Check,
  FileText,
  Code,
  ShieldAlert,
  Hash,
  Info,
  Clock,
  Percent,
  CheckCircle2,
  BadgePercent
} from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotionId: string | null;
};

export function PromotionDetailsModal({ open, onOpenChange, promotionId }: Props) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json">("overview");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    if (!open || !promotionId) {
      setPromotion(null);
      setActiveTab("overview");
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await promotionService.getPromotion(promotionId);
        if (res.ok) {
          setPromotion(res.data);
        } else {
          toast.error("Failed to load promotion details");
        }
      } catch (err: any) {
        console.error("Error fetching promotion:", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to load promotion details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, promotionId]);

  const handleCopyText = (text: string, type: "id" | "code" | "json") => {
    navigator.clipboard.writeText(text);
    toast.success(`${type.toUpperCase()} copied to clipboard`);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === "json") {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const formatCurrency = (paisa?: number | null) => {
    if (paisa === undefined || paisa === null) return "N/A";
    const rupees = paisa / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(rupees);
  };

  const getPromotionTypeBadgeColor = (type: string) => {
    switch (type) {
      case "FREE_DELIVERY":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
      case "BOGO":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "DISCOUNT":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getDisplayTypeBadgeColor = (type: string) => {
    switch (type) {
      case "COUPON":
        return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
      case "BANNER":
        return "bg-pink-500/10 text-pink-700 border-pink-500/20";
      case "LIST":
        return "bg-teal-500/10 text-teal-700 border-teal-500/20";
      case "HIDDEN":
        return "bg-slate-500/10 text-slate-700 border-slate-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const jsonResponse = promotion
    ? JSON.stringify({ ok: true, data: promotion }, null, 2)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-xl max-h-[85vh] overflow-y-auto p-0 gap-0 border border-border/60 bg-background shadow-2xl rounded-2xl"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-[#2d7a4f]" />
            <span className="text-xs font-medium animate-pulse">Fetching promotion details...</span>
          </div>
        ) : !promotion ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 text-destructive/80" />
            <span className="text-sm font-medium">Promotion details could not be loaded.</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header Area */}
            <div className="relative bg-muted/20 p-6 border-b border-border/50">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`capitalize font-medium px-2 py-0.5 border text-xs ${getPromotionTypeBadgeColor(promotion.promotionType)}`}>
                    {promotion.promotionType.replace("_", " ").toLowerCase()}
                  </Badge>
                  <Badge variant="outline" className={`capitalize font-medium px-2 py-0.5 border text-xs ${getDisplayTypeBadgeColor(promotion.displayType)}`}>
                    {promotion.displayType}
                  </Badge>
                  {promotion.isActive ? (
                    <Badge className="bg-[#2d7a4f] text-white text-[10px] py-0.5 rounded-full font-medium shadow-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground border-border text-[10px] py-0.5 rounded-full font-medium">
                      Disabled
                    </Badge>
                  )}
                  {promotion.isStackable ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0.5 rounded-full font-medium">
                      Stackable
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 text-[10px] py-0.5 rounded-full font-medium">
                      Non-Stackable
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold text-foreground tracking-tight leading-snug">
                    {promotion.title}
                  </DialogTitle>
                  {promotion.subtitle && (
                    <p className="text-xs text-muted-foreground">{promotion.subtitle}</p>
                  )}
                </div>

                {promotion.code && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Promo Code:</span>
                    <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-lg border border-border/60 font-mono text-xs font-bold text-foreground">
                      {promotion.code}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => handleCopyText(promotion.code || "", "code")}
                      >
                        {copiedCode ? <Check className="h-3 w-3 text-[#2d7a4f]" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1.5 mt-5 border-b border-border/40 pb-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all border-b-2 -mb-0.5 cursor-pointer ${
                    activeTab === "overview"
                      ? "border-[#2d7a4f] text-[#2d7a4f]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all border-b-2 -mb-0.5 cursor-pointer ${
                    activeTab === "json"
                      ? "border-[#2d7a4f] text-[#2d7a4f]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Overview / Content Area */}
            <div className="p-6">
              {activeTab === "overview" ? (
                <div className="space-y-5">
                  {/* Terms and Conditions */}
                  {promotion.terms && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        Terms & Conditions
                      </h4>
                      <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/40">
                        {promotion.terms}
                      </p>
                    </div>
                  )}

                  {/* Rewards & Conditions grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Action Block */}
                    <div className="border border-border/60 rounded-xl p-4 bg-card space-y-2.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-border/60">
                        <Percent className="h-3.5 w-3.5 text-[#2d7a4f]" />
                        Reward / Actions
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Action Type:</span>
                          <span className="font-semibold text-foreground">{promotion.actions.type}</span>
                        </div>
                        {promotion.actions.value !== undefined && promotion.actions.value !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-bold text-[#2d7a4f]">{promotion.actions.value}% Off</span>
                          </div>
                        )}
                        {promotion.actions.valuePaisa !== undefined && promotion.actions.valuePaisa !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount Value:</span>
                            <span className="font-bold text-[#2d7a4f]">{formatCurrency(promotion.actions.valuePaisa)}</span>
                          </div>
                        )}
                        {promotion.actions.maxDiscountPaisa !== undefined && promotion.actions.maxDiscountPaisa !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Cap Limit:</span>
                            <span className="font-semibold text-foreground">{formatCurrency(promotion.actions.maxDiscountPaisa)}</span>
                          </div>
                        )}
                        {promotion.actions.buyQuantity !== undefined && promotion.actions.buyQuantity !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Buy Quantity:</span>
                            <span className="font-semibold text-foreground">{promotion.actions.buyQuantity}</span>
                          </div>
                        )}
                        {promotion.actions.freeQuantity !== undefined && promotion.actions.freeQuantity !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Free Quantity:</span>
                            <span className="font-bold text-[#2d7a4f]">{promotion.actions.freeQuantity} Free</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conditions Block */}
                    <div className="border border-border/60 rounded-xl p-4 bg-card space-y-2.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-border/60">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#2d7a4f]" />
                        Eligibility Conditions
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Order Value:</span>
                          <span className="font-semibold text-foreground">
                            {promotion.conditions.minOrderValue !== undefined && promotion.conditions.minOrderValue !== null
                              ? formatCurrency(promotion.conditions.minOrderValue)
                              : "None"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">First Order Only:</span>
                          <span className="font-semibold text-foreground">{promotion.conditions.isFirstOrder ? "Yes" : "No"}</span>
                        </div>
                        {promotion.conditions.categoryIds && promotion.conditions.categoryIds.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground">Category IDs:</span>
                            <span className="font-mono text-[11px] text-muted-foreground truncate">{promotion.conditions.categoryIds.join(", ")}</span>
                          </div>
                        )}
                        {promotion.conditions.productIds && promotion.conditions.productIds.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground">Product IDs:</span>
                            <span className="font-mono text-[11px] text-muted-foreground truncate">{promotion.conditions.productIds.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Budget & Redemptions Progress */}
                  <div className="border border-border/60 rounded-xl p-4 bg-card space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-border/60">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      Usage & Budget Tracking
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Redemptions count */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Redemptions:</span>
                          <span className="text-foreground">
                            {promotion.redemptionsCount} / {promotion.maxRedemptions || "∞"}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2d7a4f]"
                            style={{
                              width: promotion.maxRedemptions
                                ? `${Math.min(100, (promotion.redemptionsCount / promotion.maxRedemptions) * 100)}%`
                                : "10%"
                            }}
                          />
                        </div>
                      </div>

                      {/* Budget status */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Budget Used:</span>
                          <span className="text-foreground">
                            {formatCurrency(promotion.budgetUsedPaisa)} / {promotion.budgetCapPaisa ? formatCurrency(promotion.budgetCapPaisa) : "∞"}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2d7a4f]"
                            style={{
                              width: promotion.budgetCapPaisa
                                ? `${Math.min(100, (promotion.budgetUsedPaisa / promotion.budgetCapPaisa) * 100)}%`
                                : "10%"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates & System ID */}
                  <div className="pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>Valid: {new Date(promotion.validFrom).toLocaleDateString()} to {new Date(promotion.validUntil).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>Created: {new Date(promotion.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-muted/10 p-2.5 rounded-xl border border-border/40 flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Promotion ID</span>
                      <span className="text-xs font-mono text-foreground truncate">{promotion.id}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                      onClick={() => handleCopyText(promotion.id, "id")}
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-[#2d7a4f]" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-mono">Response Payload</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs cursor-pointer"
                      onClick={() => handleCopyText(jsonResponse, "json")}
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-3 w-3 text-[#2d7a4f]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative rounded-xl border border-border bg-[#0d1117] text-[#e1e4e8] p-4 overflow-x-auto font-mono text-xs max-h-[40vh] leading-relaxed shadow-inner">
                    <pre>{jsonResponse}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
