"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Download,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { TablePagination } from "@/components/tablePagination";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/store/walletStore";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export function WalletModule() {
  const {
    transactions,
    stats,
    isLoading,
    isStatsLoading,
    fetchTransactions,
    fetchStats,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search,
    type,
    status,
    setFilters,
    adjustBalance,
  } = useWalletStore(
    useShallow((state) => ({
      transactions: state.transactions,
      stats: state.stats,
      isLoading: state.isLoading,
      isStatsLoading: state.isStatsLoading,
      fetchTransactions: state.fetchTransactions,
      fetchStats: state.fetchStats,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      type: state.type,
      status: state.status,
      setFilters: state.setFilters,
      adjustBalance: state.adjustBalance,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);

  // Manual Adjustment Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (mounted && debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters, mounted]);

  const hasActiveFilters = search !== "" || type !== "all" || status !== "all";

  const clearFilters = () => {
    setFilters({ search: "", type: "all", status: "all" });
  };

  const handleAdjustBalance = async () => {
    if (!adjustUserId || !adjustAmount || !adjustReason) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await adjustBalance(adjustUserId, {
        amount: Number(adjustAmount),
        reason: adjustReason,
        type: adjustType,
      });
      toast.success("Balance adjusted successfully");
      setIsAdjustOpen(false);
      setAdjustUserId("");
      setAdjustAmount("");
      setAdjustReason("");
    } catch (err) {
      toast.error("Failed to adjust balance");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <PageHeader
        title="Platform Wallet"
        description="Monitor system balances, user top-ups, and chef earnings."
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setAdjustType("credit");
                setIsAdjustOpen(true);
              }}
              className="bg-[#2d7a4f] hover:bg-[#236040] text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Credit User
            </Button>
            <Button
              onClick={() => {
                setAdjustType("debit");
                setIsAdjustOpen(true);
              }}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Minus className="mr-2 h-4 w-4" /> Debit User
            </Button>
          </div>
        }
      />

      <PageBody>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Total System Balance</h3>
              <Wallet className="h-5 w-5 text-indigo-500" />
            </div>
            {isStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(stats?.totalBalance || 0)}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Total Top-ups</h3>
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            </div>
            {isStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(stats?.totalTopups || 0)}
              </div>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Total Payouts</h3>
              <ArrowDownRight className="h-5 w-5 text-amber-500" />
            </div>
            {isStatsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(stats?.totalPayouts || 0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 mb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-3xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by TXN ID, User Name, or ID..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f]"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="w-[180px]">
              <FilterSelect
                value={type}
                onValueChange={(val) => setFilters({ type: val })}
                placeholder="All Types"
                options={[
                  { value: "all", label: "All Types" },
                  { value: "topup", label: "Top-up" },
                  { value: "earning", label: "Earning" },
                  { value: "deduction", label: "Deduction" },
                  { value: "refund", label: "Refund" },
                  { value: "payout", label: "Payout" },
                ]}
                className="h-10 rounded-lg border-border/60"
              />
            </div>

            <div className="w-[160px]">
              <FilterSelect
                value={status}
                onValueChange={(val) => setFilters({ status: val })}
                placeholder="All Statuses"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "success", label: "Success" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ]}
                className="h-10 rounded-lg border-border/60"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10 px-3 text-sm text-[#2d7a4f] hover:bg-[#2d7a4f]/5"
              >
                <X className="h-4 w-4 mr-1.5" /> Clear
              </Button>
            )}
          </div>

          <Button variant="outline" className="h-10 px-4 shrink-0 gap-2 font-medium">
            <Download className="h-4 w-4 text-muted-foreground" />
            Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] opacity-60" />
          </div>
        ) : (
          <>
            <DataTable
              rows={transactions}
              columns={[
                {
                  key: "id",
                  label: "Transaction ID",
                  className: "py-3 px-4",
                  render: (t) => (
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">{t.id}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "user",
                  label: "User",
                  className: "py-3 px-4",
                  render: (t) => (
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-sm">{t.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.userType.toUpperCase()} • {t.userId}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "type",
                  label: "Type",
                  className: "py-3 px-4",
                  render: (t) => (
                    <Badge variant="outline" className="capitalize text-xs font-medium">
                      {t.type}
                    </Badge>
                  ),
                },
                {
                  key: "referenceId",
                  label: "Reference",
                  className: "py-3 px-4",
                  render: (t) => (
                    t.referenceId ? (
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {t.referenceId}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )
                  ),
                },
                {
                  key: "amount",
                  label: "Amount",
                  className: "py-3 px-4 text-right",
                  render: (t) => (
                    <span className={`font-semibold ${t.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  className: "py-3 px-4 text-right",
                  render: (t) => <StatusBadge value={t.status} />,
                },
              ]}
            />
            
            <TablePagination
              currentPage={history.length + 1}
              totalPages={nextCursor ? history.length + 2 : history.length + 1}
              limit={limit}
              onPageChange={async (page) => {
                if (page > history.length + 1) await goToNextPage();
                else if (page < history.length + 1) await goToPreviousPage();
              }}
              onLimitChange={setLimit}
            />
          </>
        )}
      </PageBody>

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{adjustType === "credit" ? "Credit User Balance" : "Debit User Balance"}</DialogTitle>
            <DialogDescription>
              {adjustType === "credit" 
                ? "Manually add funds to a user or chef's wallet."
                : "Manually deduct funds from a user or chef's wallet."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="e.g. USR-123 or CHF-456"
                value={adjustUserId}
                onChange={(e) => setAdjustUserId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason / Note</Label>
              <Input
                id="reason"
                placeholder="e.g. Promotional credit, Penalty, etc."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdjustBalance} 
              disabled={isSubmitting}
              className={adjustType === "credit" ? "bg-[#2d7a4f] hover:bg-[#236040]" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {adjustType === "credit" ? "Credit Balance" : "Debit Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
