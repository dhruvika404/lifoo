"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, X, Users, CheckCircle2, Loader2, MoreVertical, Eye, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, StatusBadge, DataTable, StatCard } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { SuspendChefModal } from "./suspendChefModal";
import { ActivateChefModal } from "./activateChefModal";
import { useChefStore } from "@/store/chefStore";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";
import { Chef } from "@/services";

export function ChefsModule() {
  const { chefs, isLoading, fetchChefs, suspendChef, activateChef } = useChefStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [chefToSuspend, setChefToSuspend] = useState<Chef | null>(null);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [chefToActivate, setChefToActivate] = useState<Chef | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  useEffect(() => {
    if (debouncedSearchQuery.length % 2 === 0) {
      setAppliedSearchQuery(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchChefs({
      search: appliedSearchQuery,
      status: statusFilter,
      kycStatus: kycFilter,
    });
  }, [appliedSearchQuery, statusFilter, kycFilter, fetchChefs]);

  const stats = useMemo(() => {
    const total = chefs.length;
    const active = chefs.filter((c) => c?.user?.status?.toLowerCase() === "active").length;
    const avgPlatformFee = total > 0
      ? (chefs.reduce((sum, c) => sum + (Number(c?.platformFeePct) || 0), 0) / total).toFixed(1)
      : "0";
    const avgCommission = total > 0
      ? (chefs.reduce((sum, c) => sum + (Number(c?.commissionPct) || 0), 0) / total).toFixed(1)
      : "0";

    return {
      total,
      active,
      avgPlatformFee,
      avgCommission,
    };
  }, [chefs]);

  const filteredChefs = useMemo(() => {
    return chefs.filter((chef) => {
      const businessName = chef?.businessName || "";
      const displayName = chef?.displayName || "";
      const userId = chef?.userId || "";
      const kycStatus = chef?.kycStatus || "";
      const status = chef?.user?.status || "";
      const phone = chef?.user?.phone || "";

      const matchesSearch =
        businessName.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        displayName.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        userId.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        phone.includes(appliedSearchQuery);

      const matchesKyc = kycFilter === "all" || kycStatus.toLowerCase() === kycFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesKyc && matchesStatus;
    });
  }, [chefs, appliedSearchQuery, kycFilter, statusFilter]);

  const handleSuspend = (chef: Chef) => {
    setChefToSuspend(chef);
    setIsSuspendOpen(true);
  };

  const confirmSuspend = async () => {
    if (!chefToSuspend) return;
    try {
      await suspendChef(chefToSuspend.userId);
      toast.success("Chef suspended successfully!");
      setIsSuspendOpen(false);
      setChefToSuspend(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to suspend chef");
    }
  };

  const handleActivate = (chef: Chef) => {
    setChefToActivate(chef);
    setIsActivateOpen(true);
  };

  const confirmActivate = async () => {
    if (!chefToActivate) return;
    try {
      await activateChef(chefToActivate.userId);
      toast.success("Chef activated successfully!");
      setIsActivateOpen(false);
      setChefToActivate(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to activate chef");
    }
  };

  const hasActiveFilters = searchQuery !== "" || kycFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    setKycFilter("all");
    setStatusFilter("all");
  };

  return (
    <>
      <PageHeader
        title="Chef Management"
        description="Onboard, manage, and monitor chefs"
      />

      <PageBody>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total Chefs"
            value={stats.total}
            hint="Onboarded culinary partners"
            accent
          />
          <StatCard
            label="Active Chefs"
            value={stats.active}
            hint="Currently active on platform"
          />
          <StatCard
            label="Avg. Platform Fee"
            value={`${stats.avgPlatformFee}%`}
            hint="Platform revenue rate"
          />
          <StatCard
            label="Avg. Commission"
            value={`${stats.avgCommission}%`}
            hint="Chef commission rate"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b pb-4 mt-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by chef, business, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setAppliedSearchQuery("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="w-[160px]">
            <FilterSelect
              value={kycFilter}
              onValueChange={setKycFilter}
              placeholder="All KYC Statuses"
              options={[
                { value: "all", label: "All KYC Statuses" },
                { value: "pending", label: "Pending" },
                { value: "verified", label: "Verified" },
                { value: "rejected", label: "Rejected" },
                { value: "submitted", label: "Submitted" },
              ]}
              className="h-10 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm"
            />
          </div>

          <div className="w-[160px]">
            <FilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="All Statuses"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
                { value: "blocked", label: "Blocked" },
              ]}
              className="h-10 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-10 px-3 text-sm text-[#2d7a4f] hover:text-[#225c3c] hover:bg-[#2d7a4f]/5 font-semibold gap-1.5"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f] mb-3" />
            <p className="text-sm font-semibold text-foreground animate-pulse">Fetching latest chefs...</p>
            <p className="text-xs text-muted-foreground mt-0.5">Retrieving data from platform database.</p>
          </div>
        ) : (
          <>
            <DataTable
              rows={filteredChefs}
              columns={[
                {
                  key: "businessName",
                  label: "Business",
                  render: (r) => (
                    <Link href={`/chefs/${r.userId}`} className="font-semibold text-foreground hover:text-[#2d7a4f] hover:underline transition-colors">
                      {r?.businessName || "Unnamed Kitchen"}
                    </Link>
                  )
                },
                {
                  key: "displayName",
                  label: "Owner",
                  render: (r) => (
                    <Link href={`/chefs/${r.userId}`} className="hover:text-[#2d7a4f] hover:underline transition-colors">
                      {r?.displayName || "N/A"}
                    </Link>
                  )
                },
                {
                  key: "phone",
                  label: "Phone",
                  render: (r) => r?.user?.phone || "N/A"
                },
                {
                  key: "kycStatus",
                  label: "KYC Status",
                  render: (r) => <StatusBadge value={r?.kycStatus || "pending"} />
                },
                {
                  key: "progress",
                  label: "Progress",
                  className: "min-w-[280px]",
                  render: (r) => {
                    const uploadedPct = (r as any)?.onboarding?.overallPercentage || 0;
                    const approvedPct = (r as any)?.onboarding?.overallApprovedPercentage || 0;

                    return (
                      <div className="flex flex-col gap-1.5 w-full pr-8">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Approved: {approvedPct}%
                          </span>
                          <span className="text-amber-600 flex items-center gap-1">
                            Uploaded: {uploadedPct}%
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          </span>
                        </div>
                        <div className="h-2 w-full bg-secondary overflow-hidden rounded-full flex">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${approvedPct}%` }}
                            title={`Approved: ${approvedPct}%`}
                          />
                          <div
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${Math.max(0, uploadedPct - approvedPct)}%` }}
                            title={`Uploaded pending approval: ${Math.max(0, uploadedPct - approvedPct)}%`}
                          />
                        </div>
                      </div>
                    );
                  }
                },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => <StatusBadge value={r?.user?.status || "inactive"} />
                },
                {
                  key: "actions",
                  label: "Actions",
                  className: "text-center w-[80px]",
                  render: (r) => (
                    <div className="flex justify-center relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === r.userId ? null : r.userId);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeMenuId === r.userId && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 mt-8 w-36 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg py-1 z-40 animate-in fade-in slide-in-from-top-1 duration-100">
                            <Link
                              href={`/chefs/${r.userId}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors text-left text-foreground cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </Link>
                            {r?.user?.status?.toLowerCase() === "suspended" ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleActivate(r);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-emerald-500/10 text-emerald-600 transition-colors text-left cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Activate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleSuspend(r);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-destructive/10 text-destructive transition-colors text-left cursor-pointer"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Suspend
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
            />

            {filteredChefs.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No chefs found</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try clearing filters or adjusting your search term.</p>
              </div>
            )}
          </>
        )}
      </PageBody>

      <SuspendChefModal
        open={isSuspendOpen}
        onOpenChange={setIsSuspendOpen}
        chefName={chefToSuspend?.displayName || chefToSuspend?.businessName || "this chef"}
        onConfirm={confirmSuspend}
      />

      <ActivateChefModal
        open={isActivateOpen}
        onOpenChange={setIsActivateOpen}
        chefName={chefToActivate?.displayName || chefToActivate?.businessName || "this chef"}
        onConfirm={confirmActivate}
      />
    </>
  );
}
