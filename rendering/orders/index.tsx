"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Eye,
  Download,
  MoreVertical,
  Loader2,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { ViewOrderModal } from "./viewOrderModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrderStore } from "@/store/orderStore";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";
import { TablePagination } from "@/components/tablePagination";

export function OrdersModule() {
  const {
    orders,
    isLoading,
    fetchOrders,
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
    updateOrderStatus,
  } = useOrderStore(
    useShallow((state) => ({
      orders: state.orders,
      isLoading: state.isLoading,
      fetchOrders: state.fetchOrders,
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
      updateOrderStatus: state.updateOrderStatus,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  const handleOpenView = (id: string) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleExport = () => {
    if (orders.length === 0) return toast.error("No orders to export");
    toast.success("Exporting order data to CSV...");
    const headers = ["Order ID", "Customer Name", "Customer Phone", "Items", "Total", "Status", "Date"];
    const csvRows = [headers.join(",")];

    orders.forEach((o) => {
      csvRows.push([
        o.id,
        `"${o.customer.name}"`,
        o.customer.phone,
        o.items.length,
        o.total,
        o.status,
        new Date(o.createdAt).toISOString()
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lifoo_orders_${new Date().toISOString().split("T")[0]}.csv`);
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
        title="Orders Management"
        description="Monitor and manage customer orders and fulfillment status"
      />
      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, Customer Name..."
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

            <div className="w-[180px]">
              <FilterSelect
                value={status}
                onValueChange={(val) => setFilters({ status: val })}
                placeholder="All Statuses"
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "preparing", label: "Preparing" },
                  { value: "ready", label: "Ready" },
                  { value: "out_for_delivery", label: "Out for Delivery" },
                  { value: "delivered", label: "Delivered" },
                  { value: "cancelled", label: "Cancelled" },
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
            disabled={orders.length === 0}
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
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No orders found.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try adjusting search filters.
              </p>
            </div>
          ) : (
            <>
              <DataTable
                rows={orders}
                columns={[
                  {
                    key: "id",
                    label: "Order ID",
                    className: "py-3 px-4",
                    render: (o) => (
                      <span className="text-xs font-mono font-semibold text-[#2d7a4f]">{o.id}</span>
                    ),
                  },
                  {
                    key: "customer",
                    label: "Customer",
                    className: "py-3 px-4",
                    render: (o) => (
                      <div>
                        <p className="font-semibold text-foreground">{o.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                      </div>
                    ),
                  },
                  {
                    key: "items",
                    label: "Items",
                    className: "py-3 px-4 text-sm font-medium",
                    render: (o) => `${o.items.length} item(s)`,
                  },
                  {
                    key: "total",
                    label: "Total",
                    className: "py-3 px-4 font-semibold",
                    render: (o) => formatCurrency(o.total),
                  },
                  {
                    key: "date",
                    label: "Date",
                    className: "py-3 px-4 text-sm text-muted-foreground",
                    render: (o) => new Date(o.createdAt).toLocaleString(),
                  },
                  {
                    key: "status",
                    label: "Status",
                    className: "py-3 px-4",
                    render: (o) => <StatusBadge value={o.status} />,
                  },
                  {
                    key: "actions",
                    label: "",
                    className: "py-3 px-4 text-right w-[80px]",
                    render: (o) => (
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
                        <PopoverContent align="end" className="w-48 p-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenView(o.id);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-foreground cursor-pointer rounded-md"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            View details
                          </button>

                          {o.status === "pending" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(o.id, "preparing");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-amber-600 hover:text-amber-700 cursor-pointer rounded-md"
                            >
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              Mark as Preparing
                            </button>
                          )}

                          {o.status === "preparing" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(o.id, "ready");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-blue-600 hover:text-blue-700 cursor-pointer rounded-md"
                            >
                              <Package className="h-3.5 w-3.5 text-blue-600" />
                              Mark as Ready
                            </button>
                          )}

                          {o.status === "ready" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(o.id, "out_for_delivery");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-indigo-600 hover:text-indigo-700 cursor-pointer rounded-md"
                            >
                              <Truck className="h-3.5 w-3.5 text-indigo-600" />
                              Out for Delivery
                            </button>
                          )}

                          {o.status === "out_for_delivery" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(o.id, "delivered");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-emerald-600 hover:text-emerald-700 cursor-pointer rounded-md"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Mark as Delivered
                            </button>
                          )}

                          {o.status !== "delivered" && o.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(o.id, "cancelled");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-red-600 hover:text-red-700 cursor-pointer rounded-md mt-1 border-t border-border/40 pt-2"
                            >
                              <Ban className="h-3.5 w-3.5 text-red-600" />
                              Cancel Order
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

      <ViewOrderModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        orderId={selectedOrderId}
      />
    </>
  );
}
