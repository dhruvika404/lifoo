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
  MapPin,
  CheckCircle2,
  Truck,
  Ban,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable, StatusBadge } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import { ViewDeliveryModal } from "./viewDeliveryModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDeliveryStore } from "@/store/deliveryStore";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";
import { TablePagination } from "@/components/tablePagination";

export function DeliveryModule() {
  const {
    deliveries,
    isLoading,
    fetchDeliveries,
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
    updateDeliveryStatus,
    assignRider
  } = useDeliveryStore(
    useShallow((state) => ({
      deliveries: state.deliveries,
      isLoading: state.isLoading,
      fetchDeliveries: state.fetchDeliveries,
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
      updateDeliveryStatus: state.updateDeliveryStatus,
      assignRider: state.assignRider
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchDeliveries();
  }, [fetchDeliveries]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  const handleOpenView = (id: string) => {
    setSelectedDeliveryId(id);
    setIsViewOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await updateDeliveryStatus(id, newStatus);
      toast.success(`Delivery status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleAssignMockRider = async (id: string) => {
    // For demo purposes, we automatically assign RIDER-1
    try {
      await assignRider(id, "RIDER-1");
      toast.success(`Rider assigned successfully`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign rider");
    }
  };

  const handleExport = () => {
    if (deliveries.length === 0) return toast.error("No deliveries to export");
    toast.success("Exporting delivery data to CSV...");
    const headers = ["Delivery ID", "Order ID", "Customer", "Rider", "Status", "Date"];
    const csvRows = [headers.join(",")];

    deliveries.forEach((d) => {
      csvRows.push([
        d.id,
        d.orderId,
        `"${d.customerName}"`,
        d.rider ? `"${d.rider.name}"` : "Unassigned",
        d.status,
        new Date(d.createdAt).toISOString()
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lifoo_deliveries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = search !== "" || status !== "all";

  const clearFilters = () => {
    resetFilters();
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Delivery Management"
        description="Monitor active deliveries, assign riders, and track routing"
      />
      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Delivery ID, Order ID, Rider..."
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
                  { value: "unassigned", label: "Unassigned" },
                  { value: "assigned", label: "Assigned" },
                  { value: "in_transit", label: "In Transit" },
                  { value: "delivered", label: "Delivered" },
                  { value: "failed", label: "Failed" },
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
            disabled={deliveries.length === 0}
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
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No deliveries found.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try adjusting search filters.
              </p>
            </div>
          ) : (
            <>
              <DataTable
                rows={deliveries}
                columns={[
                  {
                    key: "id",
                    label: "Delivery ID",
                    className: "py-3 px-4",
                    render: (d) => (
                      <div>
                        <span className="text-xs font-mono font-semibold text-[#2d7a4f] block">{d.id}</span>
                        <span className="text-xs text-muted-foreground">Order: {d.orderId}</span>
                      </div>
                    ),
                  },
                  {
                    key: "customer",
                    label: "Customer & Destination",
                    className: "py-3 px-4",
                    render: (d) => (
                      <div>
                        <p className="font-semibold text-foreground text-sm">{d.customerName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 max-w-[200px] truncate">
                          <MapPin className="h-3 w-3" /> {d.dropoffAddress.line1}, {d.dropoffAddress.city}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "rider",
                    label: "Assigned Rider",
                    className: "py-3 px-4",
                    render: (d) => d.rider ? (
                      <div>
                        <p className="font-semibold text-foreground text-sm">{d.rider.name}</p>
                        <p className="text-xs text-muted-foreground">{d.rider.phone}</p>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                        Unassigned
                      </span>
                    ),
                  },
                  {
                    key: "date",
                    label: "Created",
                    className: "py-3 px-4 text-sm text-muted-foreground",
                    render: (d) => new Date(d.createdAt).toLocaleString(),
                  },
                  {
                    key: "status",
                    label: "Status",
                    className: "py-3 px-4",
                    render: (d) => <StatusBadge value={d.status} />,
                  },
                  {
                    key: "actions",
                    label: "",
                    className: "py-3 px-4 text-right w-[80px]",
                    render: (d) => (
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
                              handleOpenView(d.id);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-foreground cursor-pointer rounded-md"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            View details
                          </button>

                          {d.status === "unassigned" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignMockRider(d.id);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-blue-600 hover:text-blue-700 cursor-pointer rounded-md"
                            >
                              <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                              Assign Rider
                            </button>
                          )}

                          {d.status === "assigned" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(d.id, "in_transit");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-indigo-600 hover:text-indigo-700 cursor-pointer rounded-md"
                            >
                              <Truck className="h-3.5 w-3.5 text-indigo-600" />
                              Mark In Transit
                            </button>
                          )}

                          {d.status === "in_transit" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(d.id, "delivered");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-emerald-600 hover:text-emerald-700 cursor-pointer rounded-md"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Mark as Delivered
                            </button>
                          )}

                          {d.status !== "delivered" && d.status !== "failed" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(d.id, "failed");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-red-600 hover:text-red-700 cursor-pointer rounded-md mt-1 border-t border-border/40 pt-2"
                            >
                              <Ban className="h-3.5 w-3.5 text-red-600" />
                              Mark Failed
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

      <ViewDeliveryModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        deliveryId={selectedDeliveryId}
      />
    </>
  );
}
