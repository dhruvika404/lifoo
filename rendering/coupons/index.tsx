"use client";

import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  Trash2,
  Edit,
  Eye,
  Calendar,
  AlertCircle,
  Loader2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PageHeader,
  PageBody,
  StatCard
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
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import toast from "react-hot-toast";
import { usePromotionStore } from "@/store/promotionStore";
import { useDebounce } from "@/hooks/use-debounce";
import { Promotion } from "@/services/promotion.service";
import { PromotionFormModal } from "./promotionFormModal";
import { PromotionDetailsModal } from "./promotionDetailsModal";
import { PromotionDeleteModal } from "./promotionDeleteModal";

export function CouponsModule() {
  const {
    promotions,
    isLoading,
    error,
    limit,
    nextCursor,
    history,
    search,
    promotionType,
    displayType,
    isActive,
    setLimit,
    setFilters,
    resetFilters,
    fetchPromotions,
    goToNextPage,
    goToPreviousPage,
    deletePromotion,
    togglePromotionActive,
    togglePromotionStackable,
  } = usePromotionStore(
    useShallow((state) => ({
      promotions: state.promotions,
      isLoading: state.isLoading,
      error: state.error,
      limit: state.limit,
      nextCursor: state.nextCursor,
      history: state.history,
      search: state.search,
      promotionType: state.promotionType,
      displayType: state.displayType,
      isActive: state.isActive,
      setLimit: state.setLimit,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      fetchPromotions: state.fetchPromotions,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      deletePromotion: state.deletePromotion,
      togglePromotionActive: state.togglePromotionActive,
      togglePromotionStackable: state.togglePromotionStackable,
    }))
  );

  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingStackableId, setTogglingStackableId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    try {
      await togglePromotionActive(id, currentActive);
      toast.success(`Promotion ${currentActive ? "disabled" : "enabled"} successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleStackable = async (id: string, currentStackable: boolean) => {
    setTogglingStackableId(id);
    try {
      await togglePromotionStackable(id, currentStackable);
      toast.success(`Stacking ${currentStackable ? "disabled" : "enabled"} successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to toggle stacking status");
    } finally {
      setTogglingStackableId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;
    try {
      await deletePromotion(promotionToDelete.id);
      toast.success(`Promotion "${promotionToDelete.title}" deleted successfully`);
      setDeleteOpen(false);
      setPromotionToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete promotion");
    }
  };

  const getRewardText = (promo: Promotion) => {
    const action = promo.actions;
    switch (action.type) {
      case "WAIVE_DELIVERY_FEE":
        return "Free Delivery";
      case "BOGO":
        return `Buy ${action.buyQuantity} Get ${action.freeQuantity}`;
      case "FLAT_SUBTOTAL":
        return `Flat ₹${(action.valuePaisa || 0) / 100} Off`;
      case "PERCENTAGE_SUBTOTAL":
        return `${action.value}% Off Subtotal`;
      case "PERCENTAGE_CATEGORY":
        return `${action.value}% Off Category`;
      default:
        return "Custom Reward";
    }
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

  const activeFiltersCount = [
    promotionType !== undefined,
    displayType !== undefined,
    isActive !== undefined
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchVal("");
    resetFilters();
    toast.success("Filters cleared");
  };

  const stats = React.useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter(p => p.isActive).length;
    const couponsCount = promotions.filter(p => p.displayType === "COUPON").length;
    return { total, active, couponsCount };
  }, [promotions]);

  return (
    <>
      <PageHeader
        title="Coupons & Promotions"
        description="Manage, schedule, and configure global/chef discount campaigns, welcome vouchers, and free deliveries"
        actions={
          <Button
            onClick={() => {
              setFormMode("create");
              setSelectedPromotion(null);
              setFormOpen(true);
            }}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold cursor-pointer shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Promotion
          </Button>
        }
      />

      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <StatCard
            label="Total Campaigns"
            value={stats.total}
            hint="Created in current page context"
            accent
          />
          <StatCard
            label="Active Offers"
            value={stats.active}
            hint="Currently visible to customers"
          />
          <StatCard
            label="Voucher Coupons"
            value={stats.couponsCount}
            hint="Requires checkout code entry"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-3xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or coupon code..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm w-full"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-border/60 hover:bg-muted text-foreground transition-all shrink-0 gap-2 font-medium relative cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d7a4f] text-[10px] font-bold text-white leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col justify-between h-full">
                <div className="flex-1 overflow-y-auto pr-1">
                  <SheetHeader className="pb-6 border-b border-border">
                    <SheetTitle className="text-lg font-semibold text-foreground">Filter Promotions</SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Refine the list of coupon codes and campaigns.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Promotion Type</label>
                      <Select
                        value={promotionType || "all"}
                        onValueChange={(val) => setFilters({ promotionType: val === "all" ? undefined : val })}
                      >
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Promotion Types</SelectItem>
                          <SelectItem value="DISCOUNT">Discount Vouchers</SelectItem>
                          <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
                          <SelectItem value="BOGO">BOGO (Buy 1 Get 1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Target</label>
                      <Select
                        value={displayType || "all"}
                        onValueChange={(val) => setFilters({ displayType: val === "all" ? undefined : val })}
                      >
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All targets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Display Targets</SelectItem>
                          <SelectItem value="COUPON">COUPON (vouchers)</SelectItem>
                          <SelectItem value="LIST">LIST (menu listings)</SelectItem>
                          <SelectItem value="BANNER">BANNER (page headers)</SelectItem>
                          <SelectItem value="HIDDEN">HIDDEN (loyalty targets)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                      <Select
                        value={isActive === undefined ? "all" : String(isActive)}
                        onValueChange={(val) => setFilters({ isActive: val === "all" ? undefined : val === "true" })}
                      >
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="true">Active Only</SelectItem>
                          <SelectItem value="false">Disabled Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    disabled={activeFiltersCount === 0 && !searchVal}
                    className="flex-1 h-10 font-semibold cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {(activeFiltersCount > 0 || searchVal) && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-10 text-xs font-semibold text-[#2d7a4f] hover:text-[#236040] hover:bg-emerald-500/5 gap-1 shrink-0 cursor-pointer"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm text-destructive mb-4">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4">Campaign Title</th>
                  <th className="py-3.5 px-4 w-32">Promo Code</th>
                  <th className="py-3.5 px-4 w-36">Type</th>
                  <th className="py-3.5 px-4 w-44">Reward Value</th>
                  <th className="py-3.5 px-4 w-40">Valid Until</th>
                  <th className="py-3.5 px-4 w-28">Usage Uses</th>
                  <th className="py-3.5 px-4 w-24 text-center">Stackable</th>
                  <th className="py-3.5 px-4 w-24 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                      Loading campaigns & coupons…
                    </td>
                  </tr>
                ) : promotions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-muted-foreground italic">
                      No promotions found in database. Create one above!
                    </td>
                  </tr>
                ) : (
                  promotions.map((promo, index) => {
                    const isLastTwo = index >= promotions.length - 2 && promotions.length > 2;
                    return (
                      <tr
                        key={promo.id}
                        className="group hover:bg-muted/10 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground leading-snug">
                              {promo.title}
                            </span>
                            {promo.subtitle ? (
                              <span className="text-xs text-muted-foreground truncate max-w-xs">{promo.subtitle}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40 italic">No subtitle</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs">
                          {promo.code ? (
                            <span className="inline-flex bg-muted/80 border px-2 py-0.5 rounded font-bold text-foreground">
                              {promo.code}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 italic">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className={`capitalize font-medium px-2 py-0.5 border ${getPromotionTypeBadgeColor(promo.promotionType)}`}>
                            {promo.promotionType.replace("_", " ").toLowerCase()}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {getRewardText(promo)}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                            {new Date(promo.validUntil).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-muted-foreground font-semibold">
                          {promo.redemptionsCount} / {promo.maxRedemptions || "∞"}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleStackable(promo.id, promo.isStackable)}
                            disabled={togglingStackableId === promo.id}
                            title={promo.isStackable ? "Disable stacking" : "Enable stacking"}
                            className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${promo.isStackable ? "bg-[#2d7a4f]" : "bg-muted-foreground/30"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${promo.isStackable ? "translate-x-4.5" : "translate-x-0"
                                }`}
                            />
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(promo.id, promo.isActive)}
                            disabled={togglingId === promo.id}
                            title={promo.isActive ? "Disable offer" : "Enable offer"}
                            className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${promo.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${promo.isActive ? "translate-x-4.5" : "translate-x-0"
                                }`}
                            />
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="relative inline-block text-left">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === promo.id ? null : promo.id);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {activeMenuId === promo.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-30 bg-black/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                />
                                <div className={`absolute right-0 w-36 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg py-1 z-40 animate-in fade-in duration-100 text-left ${isLastTwo
                                  ? "bottom-full mb-1 slide-in-from-bottom-1"
                                  : "mt-1 slide-in-from-top-1"
                                  }`}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setDetailId(promo.id);
                                      setDetailsOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-foreground cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                    View Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setSelectedPromotion(promo);
                                      setFormMode("edit");
                                      setFormOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-foreground cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setPromotionToDelete(promo);
                                      setDeleteOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-destructive hover:bg-destructive/5 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={history.length + 1}
            totalPages={nextCursor ? history.length + 2 : history.length + 1}
            limit={limit}
            onPageChange={async (page) => {
              if (page > history.length + 1) {
                goToNextPage();
              } else if (page < history.length + 1) {
                goToPreviousPage();
              }
            }}
            onLimitChange={(val) => setLimit(val)}
          />
        </div>
      </PageBody>

      <PromotionFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialData={selectedPromotion}
        onSuccess={() => fetchPromotions()}
      />

      <PromotionDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        promotionId={detailId}
      />

      <PromotionDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        promotionTitle={promotionToDelete?.title || ""}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}