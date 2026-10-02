"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Loader2,
  Check,
  Ban,
  Clock,
  Download,
  Building,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { TablePagination } from "@/components/tablePagination";
import { useFinanceStore } from "@/store/financeStore";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export function FinanceModule() {
  const {
    payouts,
    isLoading,
    fetchPayouts,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search,
    status,
    setFilters,
    updatePayoutStatus,
  } = useFinanceStore(
    useShallow((state) => ({
      payouts: state.payouts,
      isLoading: state.isLoading,
      fetchPayouts: state.fetchPayouts,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      status: state.status,
      setFilters: state.setFilters,
      updatePayoutStatus: state.updatePayoutStatus,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);

  // Review Dialog State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<"processing" | "completed" | "failed">("completed");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPayouts();
  }, [fetchPayouts]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (mounted && debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters, mounted]);

  const hasActiveFilters = search !== "" || status !== "all";

  const clearFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  const handleOpenReview = (id: string, action: "processing" | "completed" | "failed") => {
    setSelectedPayoutId(id);
    setReviewAction(action);
    setReviewNotes("");
    setIsReviewOpen(true);
  };

  const submitReview = async () => {
    if (!selectedPayoutId) return;
    setIsSubmitting(true);
    try {
      await updatePayoutStatus(selectedPayoutId, reviewAction, reviewNotes);
      toast.success(`Payout marked as ${reviewAction}`);
      setIsReviewOpen(false);
    } catch (err) {
      toast.error("Failed to update payout status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <PageHeader
        title="Payouts & Settlement"
        description="Manage chef earnings withdrawals and bank transfers."
      />

      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 mb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Payout ID, Chef, Account No..."
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
                value={status}
                onValueChange={(val) => setFilters({ status: val })}
                placeholder="All Statuses"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "processing", label: "Processing" },
                  { value: "completed", label: "Completed" },
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
            Export Bank File
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] opacity-60" />
          </div>
        ) : (
          <>
            <DataTable
              rows={payouts}
              columns={[
                {
                  key: "id",
                  label: "Payout ID",
                  className: "py-3 px-4",
                  render: (p) => (
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">{p.id}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(p.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "chef",
                  label: "Chef",
                  className: "py-3 px-4",
                  render: (p) => (
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-sm">{p.chefName}</span>
                      <span className="text-xs text-muted-foreground">ID: {p.chefId}</span>
                    </div>
                  ),
                },
                {
                  key: "bankInfo",
                  label: "Bank Info",
                  className: "py-3 px-4",
                  render: (p) => (
                    <div className="flex flex-col text-xs">
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {p.bankInfo.bankName}
                      </div>
                      <span className="text-muted-foreground mt-0.5 font-mono">
                        A/C: {p.bankInfo.accountNumber}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        IFSC: {p.bankInfo.ifsc}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "amount",
                  label: "Amount",
                  className: "py-3 px-4 font-semibold text-[#2d7a4f]",
                  render: (p) => formatCurrency(p.amount),
                },
                {
                  key: "status",
                  label: "Status",
                  className: "py-3 px-4",
                  render: (p) => <StatusBadge value={p.status} />,
                },
                {
                  key: "actions",
                  label: "",
                  className: "py-3 px-4 text-right w-[80px]",
                  render: (p) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 p-1">
                        {p.status === "pending" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(p.id, "processing");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-blue-600 hover:text-blue-700 cursor-pointer rounded-md"
                          >
                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                            Mark Processing
                          </button>
                        )}
                        {(p.status === "pending" || p.status === "processing") && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReview(p.id, "completed");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-emerald-600 hover:text-emerald-700 cursor-pointer rounded-md"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              Mark Completed
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReview(p.id, "failed");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-rose-600 hover:text-rose-700 cursor-pointer rounded-md"
                            >
                              <Ban className="h-3.5 w-3.5 text-rose-600" />
                              Fail Payout
                            </button>
                          </>
                        )}
                      </PopoverContent>
                    </Popover>
                  ),
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

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "processing" ? "Process Payout" : reviewAction === "completed" ? "Complete Payout" : "Fail Payout"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "processing"
                ? "Mark this payout as currently being processed by the bank."
                : reviewAction === "completed"
                  ? "Confirm that this payout has successfully landed in the chef's bank account."
                  : "Mark this payout as failed (e.g. invalid bank details) and return funds to the chef's wallet."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Admin Notes / Reference {reviewAction === "failed" && <span className="text-red-500">*</span>}</Label>
              <Textarea
                id="notes"
                placeholder={reviewAction === "failed" ? "Reason for failure..." : "Bank reference number..."}
                value={reviewNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={isSubmitting || (reviewAction === "failed" && !reviewNotes.trim())}
              className={
                reviewAction === "completed" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                  reviewAction === "processing" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                    "bg-rose-600 hover:bg-rose-700 text-white"
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === "completed" ? "Complete Payout" : reviewAction === "processing" ? "Process Payout" : "Fail Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
