"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Loader2,
  Check,
  Ban,
  RefreshCcw,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { TablePagination } from "@/components/tablePagination";
import { useRefundStore } from "@/store/refundStore";
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

export function RefundsModule() {
  const {
    refunds,
    isLoading,
    fetchRefunds,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search,
    status,
    setFilters,
    updateRefundStatus,
  } = useRefundStore(
    useShallow((state) => ({
      refunds: state.refunds,
      isLoading: state.isLoading,
      fetchRefunds: state.fetchRefunds,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      status: state.status,
      setFilters: state.setFilters,
      updateRefundStatus: state.updateRefundStatus,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);

  // Review Dialog State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | "processed">("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRefunds();
  }, [fetchRefunds]);

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

  const handleOpenReview = (id: string, action: "approved" | "rejected" | "processed") => {
    setSelectedRefundId(id);
    setReviewAction(action);
    setReviewNotes("");
    setIsReviewOpen(true);
  };

  const submitReview = async () => {
    if (!selectedRefundId) return;
    setIsSubmitting(true);
    try {
      await updateRefundStatus(selectedRefundId, reviewAction, reviewNotes);
      toast.success(`Refund marked as ${reviewAction}`);
      setIsReviewOpen(false);
    } catch (err) {
      toast.error("Failed to update refund status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <PageHeader
        title="Refunds & Disputes"
        description="Review customer refund requests and manage chargebacks."
      />

      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 mb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Refund ID, Order ID, Customer..."
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
                  { value: "approved", label: "Approved" },
                  { value: "processed", label: "Processed" },
                  { value: "rejected", label: "Rejected" },
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] opacity-60" />
          </div>
        ) : (
          <>
            <DataTable
              rows={refunds}
              columns={[
                {
                  key: "id",
                  label: "Refund ID",
                  className: "py-3 px-4",
                  render: (r) => (
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">{r.id}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "order",
                  label: "Order & Customer",
                  className: "py-3 px-4",
                  render: (r) => (
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-semibold text-[#2d7a4f]">{r.orderId}</span>
                      <span className="text-sm font-semibold text-foreground">{r.customerName}</span>
                    </div>
                  ),
                },
                {
                  key: "reason",
                  label: "Reason",
                  className: "py-3 px-4 max-w-[200px]",
                  render: (r) => (
                    <p className="text-xs text-muted-foreground truncate" title={r.reason}>
                      {r.reason}
                    </p>
                  ),
                },
                {
                  key: "amount",
                  label: "Amount",
                  className: "py-3 px-4",
                  render: (r) => (
                    <span className="font-semibold text-foreground">
                      {formatCurrency(r.amount)}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  className: "py-3 px-4",
                  render: (r) => <StatusBadge value={r.status} />,
                },
                {
                  key: "actions",
                  label: "",
                  className: "py-3 px-4 text-right w-[80px]",
                  render: (r) => (
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
                        {r.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReview(r.id, "approved");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-emerald-600 hover:text-emerald-700 cursor-pointer rounded-md"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              Approve Refund
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReview(r.id, "rejected");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-rose-600 hover:text-rose-700 cursor-pointer rounded-md"
                            >
                              <Ban className="h-3.5 w-3.5 text-rose-600" />
                              Reject Refund
                            </button>
                          </>
                        )}
                        {r.status === "approved" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(r.id, "processed");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-blue-600 hover:text-blue-700 cursor-pointer rounded-md"
                          >
                            <RefreshCcw className="h-3.5 w-3.5 text-blue-600" />
                            Mark Processed
                          </button>
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
              {reviewAction === "approved" ? "Approve Refund" : reviewAction === "rejected" ? "Reject Refund" : "Mark as Processed"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "processed"
                ? "Confirm that the payment gateway has processed this refund."
                : `Are you sure you want to ${reviewAction === "approved" ? "approve" : "reject"} this refund request?`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any internal notes or reason for rejection..."
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
              disabled={isSubmitting}
              className={
                reviewAction === "approved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                  reviewAction === "processed" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                    "bg-rose-600 hover:bg-rose-700 text-white"
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === "approved" ? "Approve" : reviewAction === "processed" ? "Confirm Processed" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
