"use client";
import { getS3ImageUrl } from "@/lib/s3-utils";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryService } from "@/services";
import type { Category } from "@/services/category.service";
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
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
};

export function CategoryDetailsModal({ open, onOpenChange, categoryId }: Props) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json">("overview");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    if (!open || !categoryId) {
      setCategory(null);
      setActiveTab("overview");
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await categoryService.getCategory(categoryId);
        if (res.ok) {
          setCategory(res.data);
        } else {
          toast.error("Failed to load category details");
        }
      } catch (err: any) {
        console.error("Error fetching category:", err);
        toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to load category details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, categoryId]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyJson = (jsonStr: string) => {
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const getImageUrl = (imagePath: string | null) => {
    return getS3ImageUrl(imagePath);
  };

  const jsonResponse = category
    ? JSON.stringify({ ok: true, data: category }, null, 2)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border border-border/60 bg-background shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f]" />
            <span className="text-sm font-medium animate-pulse">Fetching category details...</span>
          </div>
        ) : !category ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 text-destructive/80" />
            <span className="text-sm font-medium">Category details could not be loaded.</span>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="relative bg-gradient-to-br from-[#2d7a4f]/10 via-background to-background p-6 border-b border-border/50">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="h-20 w-20 rounded-xl border border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                  {category.imageUrl ? (
                    <img
                      src={getImageUrl(category.imageUrl) || ""}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=" + encodeURIComponent(category.name);
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                      <span className="text-xs font-semibold uppercase">{category.name.substring(0, 2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-xl font-bold text-foreground tracking-tight truncate">
                      {category.name}
                    </DialogTitle>
                    {category.active ? (
                      <Badge className="bg-[#2d7a4f] hover:bg-[#2d7a4f] text-white text-[10px] py-0.5 rounded-full font-medium shadow-sm">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-border text-[10px] py-0.5 rounded-full font-medium">
                        Disabled
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-mono bg-muted/60 px-2 py-0.5 rounded border border-border/40 font-semibold">
                      /{category.slug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 mt-6 border-b border-border/40 pb-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all border-b-2 -mb-0.5 cursor-pointer ${activeTab === "overview"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all border-b-2 -mb-0.5 cursor-pointer ${activeTab === "json"
                      ? "border-[#2d7a4f] text-[#2d7a4f]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  Raw JSON
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "overview" ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      Description
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                      {category.description || <span className="text-muted-foreground italic">No description provided for this category.</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-muted/10 p-3 rounded-lg border border-border/30 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category ID</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-foreground truncate">{category.id}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => handleCopyId(category.id)}
                        >
                          {copiedId ? <Check className="h-3 w-3 text-[#2d7a4f]" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/10 p-3 rounded-lg border border-border/30 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Parent Category</span>
                      <span className="text-xs text-foreground font-medium">
                        {category.parentId ? (
                          <span className="font-mono">{category.parentId}</span>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground/80 bg-muted/40 font-normal">
                            None (Top-Level)
                          </Badge>
                        )}
                      </span>
                    </div>

                    <div className="bg-muted/10 p-3 rounded-lg border border-border/30 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Compliance Regime</span>
                      <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {category.complianceRegime || "None"}
                      </span>
                    </div>

                    <div className="bg-muted/10 p-3 rounded-lg border border-border/30 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort Order</span>
                      <span className="text-xs text-foreground font-semibold flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        {category.sortOrder}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span>Created: {category.createdAt ? new Date(category.createdAt).toLocaleString() : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span>Updated: {category.updatedAt ? new Date(category.updatedAt).toLocaleString() : "N/A"}</span>
                    </div>
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
                      className="h-8 gap-1.5 text-xs cursor-pointer"
                      onClick={() => handleCopyJson(jsonResponse)}
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
                  <div className="relative rounded-lg border border-border bg-[#0d1117] text-[#e1e4e8] p-4 overflow-x-auto font-mono text-xs max-h-[45vh] leading-relaxed shadow-inner">
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
