"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Download,
  SlidersHorizontal,
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Timer,
  Eye,
  EyeOff,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PageHeader,
  PageBody,
  DataTable,
  StatusBadge,
} from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useProductStore } from "@/store/productStore";
import { useShallow } from "zustand/react/shallow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/services/product.service";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export function ProductsModule() {
  const {
    products,
    isLoading: productsLoading,
    fetchProducts,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search: storeSearch,
    status: storeStatus,
    setFilters,
    resetFilters,
    updateProductStatus,
  } = useProductStore(
    useShallow((state) => ({
      products: state.products,
      isLoading: state.isLoading,
      fetchProducts: state.fetchProducts,
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
      updateProductStatus: state.updateProductStatus,
    }))
  );

  const [searchQuery, setSearchQuery] = useState(storeSearch || "");
  const [statusFilter, setStatusFilter] = useState(storeStatus || "all");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchQuery(storeSearch || "");
  }, [storeSearch]);

  useEffect(() => {
    if (debouncedSearch !== storeSearch) {
      setFilters({ search: debouncedSearch, status: statusFilter === "all" ? undefined : statusFilter });
    }
  }, [debouncedSearch, storeSearch, setFilters, statusFilter]);

  const handleApplyStatusFilter = (val: string) => {
    setStatusFilter(val);
    setFilters({
      search: debouncedSearch,
      status: val === "all" ? undefined : val,
    });
  };

  const isFiltered = !!(storeSearch || storeStatus);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    resetFilters();
    toast.success("Filters cleared");
  };

  const handleToggleStatus = async (product: Product, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateProductStatus(product.id, newStatus);
      toast.success(`Product ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      // Error handled by store
    }
  };

  const openDetails = (id: string) => {
    router.push(`/products/${id}`);
  };

  // Export
  const handleExport = useCallback(() => {
    const headers = [
      "ID",
      "Name",
      "Chef",
      "Business",
      "Phone",
      "Price",
      "Prep Time (min)",
      "Status",
      "Created At",
    ];
    const csvRows = [headers.join(",")];

    products.forEach((p) => {
      csvRows.push(
        [
          p.id,
          `"${p.name}"`,
          `"${p.chefDisplayName || ""}"`,
          `"${p.chefBusinessName || ""}"`,
          p.chefPhone || "",
          p.price || 0,
          p.preparationTimeMinutes,
          p.status,
          new Date(p.createdAt).toLocaleDateString("en-IN"),
        ].join(",")
      );
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `lifoo_products_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported product data to CSV");
  }, [products]);

  return (
    <>
      <PageHeader
        title="Product Management"
        description="View and manage all chef product listings"
      />

      <PageBody>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product name, chef, business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-border/60 hover:bg-muted text-foreground transition-all shrink-0 gap-2 font-medium relative cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  Filters
                  {statusFilter !== "all" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d7a4f] text-[10px] font-bold text-white leading-none">
                      1
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col justify-between h-full">
                <div className="flex-1 overflow-y-auto pr-1">
                  <SheetHeader className="pb-6 border-b border-border">
                    <SheetTitle className="text-lg font-semibold text-foreground">
                      Filters
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Refine your product list by applying filters.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Status
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={handleApplyStatusFilter}
                      >
                        <SelectTrigger className="h-10 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm w-full">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="border-border">
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    disabled={!isFiltered}
                    className="flex-1 h-10 text-sm font-medium border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1 h-10 text-sm font-medium bg-[#2d7a4f] hover:bg-[#236040] text-white cursor-pointer">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
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
            className="h-10 border-border/60 bg-background hover:bg-muted text-sm font-semibold gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] opacity-60" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm font-semibold text-foreground">
                No products found
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try clearing filters or adjusting your search term.
              </p>
              {isFiltered && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="mt-4 h-9 px-4 text-sm text-[#2d7a4f] hover:text-[#225c3c] hover:bg-[#2d7a4f]/5 font-semibold gap-1.5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <DataTable<Product>
            rows={products}
            columns={[
              {
                key: "name",
                label: "Product",
                render: (p) => (
                  <div className="min-w-0 flex items-center gap-2 cursor-pointer" onClick={() => openDetails(p.id)}>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground truncate max-w-[200px] hover:text-[#2d7a4f] hover:underline transition-colors">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "chefDisplayName",
                label: "Chef",
                render: (p) => (
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                      <ChefHat className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {p.chefDisplayName || "N/A"}
                    </p>
                    {p.chefBusinessName && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {p.chefBusinessName}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: "chefPhone",
                label: "Phone",
                render: (p) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {p.chefPhone || "N/A"}
                  </span>
                ),
              },
              {
                key: "price",
                label: "Price",
                render: (p) => (
                  <span className="font-semibold text-foreground flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {p.price !== undefined ? p.price : (p.basePricePaisa ? (p.basePricePaisa / 100).toFixed(2) : 0)}
                  </span>
                ),
              },
              {
                key: "preparationTimeMinutes",
                label: "Prep Time",
                render: (p) => (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5 shrink-0" />
                    {p.preparationTimeMinutes} min
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (p) => <StatusBadge value={p.status} />,
              },
              {
                key: "actions",
                label: "Actions",
                render: (p) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetails(p.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-[#2d7a4f] hover:bg-[#2d7a4f]/10 cursor-pointer transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 border-border">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(p, p.status)}
                          className="cursor-pointer text-xs"
                        >
                          {p.status === "active" ? (
                            <>
                              <EyeOff className="mr-2 h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
            onLimitChange={(val) => setLimit(val)}
          />
            </>
          )}
        </div>
      </PageBody>
    </>
  );
}
