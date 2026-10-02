"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Eye,
  Ban,
  Download,
  CheckCircle2,
  MoreVertical,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { ViewCustomerModal } from "./viewCustomerModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCustomerStore } from "@/store/customerStore";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";
import { TablePagination } from "@/components/tablePagination";

export function CustomersModule() {
  const {
    customers,
    isLoading,
    fetchCustomers,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search,
    status,
    setFilters,
    resetFilters,
    updateCustomerStatus,
  } = useCustomerStore(
    useShallow((state) => ({
      customers: state.customers,
      isLoading: state.isLoading,
      fetchCustomers: state.fetchCustomers,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      status: state.status,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      updateCustomerStatus: state.updateCustomerStatus,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  const handleOpenView = (id: string) => {
    setSelectedCustomerId(id);
    setIsViewOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: "active" | "suspended" | "blocked") => {
    try {
      await updateCustomerStatus(id, newStatus);
      toast.success(`Customer status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleExport = () => {
    if (customers.length === 0) return toast.error("No customers to export");
    toast.success("Exporting customer data to CSV...");
    const headers = ["ID", "Name", "Phone", "Email", "Joined", "Orders", "Total Spend", "Wallet", "Status"];
    const csvRows = [headers.join(",")];

    customers.forEach((c) => {
      csvRows.push([
        c.id,
        `"${c.name}"`,
        c.phone,
        c.email || "",
        c.joinedAt || c.joined || "",
        c.orders,
        c.totalSpend,
        c.wallet,
        c.status
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lifoo_customers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = search !== "" || status !== "all";

  const clearFilters = () => {
    resetFilters();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Customer Management"
        description="Manage customer accounts, wallets, and orders"
      />
      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, or customer ID..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm w-full"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="w-[160px]">
              <FilterSelect
                value={status}
                onValueChange={(val) => setFilters({ status: val })}
                placeholder="All Statuses"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "suspended", label: "Suspended" },
                  { value: "blocked", label: "Blocked" },
                ]}
                className="h-10 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm cursor-pointer"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10 px-3 text-sm text-[#2d7a4f] hover:text-[#225c3c] hover:bg-[#2d7a4f]/5 font-semibold gap-1.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={customers.length === 0}
            className="h-10 border-border/60 bg-background hover:bg-muted text-sm font-semibold gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] opacity-60" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No customers found.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try adjusting search filters.
              </p>
            </div>
          ) : (
            <>
              <DataTable
                rows={customers}
                columns={[
                  {
                    key: "id",
                    label: "ID",
                    className: "py-3 px-4",
                    render: (c) => (
                      <span className="text-xs font-mono font-semibold text-muted-foreground">{c.id}</span>
                    ),
                  },
                  {
                    key: "name",
                    label: "Name",
                    className: "py-3 px-4 font-semibold text-foreground",
                  },
                  {
                    key: "phone",
                    label: "Phone",
                    className: "py-3 px-4 text-sm font-medium",
                  },
                  {
                    key: "email",
                    label: "Email",
                    className: "py-3 px-4 text-sm text-muted-foreground",
                    render: (c) => c.email || "N/A",
                  },
                  {
                    key: "joined",
                    label: "Joined",
                    className: "py-3 px-4 text-sm text-muted-foreground",
                    render: (c) => c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : c.joined ? new Date(c.joined).toLocaleDateString() : "N/A",
                  },
                  {
                    key: "orders",
                    label: "Orders",
                    className: "py-3 px-4 text-center font-semibold",
                  },
                  {
                    key: "totalSpend",
                    label: "Total Spend",
                    className: "py-3 px-4 font-semibold",
                    render: (c) => formatCurrency(c.totalSpend),
                  },
                  {
                    key: "wallet",
                    label: "Wallet",
                    className: "py-3 px-4 font-semibold text-muted-foreground",
                    render: (c) => formatCurrency(c.wallet),
                  },
                  {
                    key: "status",
                    label: "Status",
                    className: "py-3 px-4",
                    render: (c) => <StatusBadge value={c.status} />,
                  },
                  {
                    key: "actions",
                    label: "",
                    className: "py-3 px-4 text-right w-[80px]",
                    render: (c) => (
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenView(c.id);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-foreground cursor-pointer rounded-md"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            View details
                          </button>

                          {c.status !== "active" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(c.id, "active");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-emerald-600 hover:text-emerald-700 cursor-pointer rounded-md"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Mark Active
                            </button>
                          )}

                          {c.status !== "suspended" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(c.id, "suspended");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-amber-600 hover:text-amber-700 cursor-pointer rounded-md"
                            >
                              <Ban className="h-3.5 w-3.5 text-amber-600" />
                              Suspend Account
                            </button>
                          )}

                          {c.status !== "blocked" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(c.id, "blocked");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-red-600 hover:text-red-700 cursor-pointer rounded-md"
                            >
                              <Ban className="h-3.5 w-3.5 text-red-600" />
                              Block Account
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
                  if (page > history.length + 1) {
                    await goToNextPage();
                  } else if (page < history.length + 1) {
                    await goToPreviousPage();
                  }
                }}
                onLimitChange={setLimit}
              />
            </>
          )}
        </div>
      </PageBody>

      <ViewCustomerModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        customerId={selectedCustomerId}
      />
    </>
  );
}