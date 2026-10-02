"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/tablePagination";
import { StatusBadge } from "@/components/pageShell";
import { Input } from "@/components/ui/input";
import {
  Plus,
  GripVertical,
  Loader2,
  Search,
  X,
  SlidersHorizontal,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { DeleteCategoryModal } from "./deleteCategoryModal";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddCategoryModal } from "./addCategoryModal";
import { EditCategoryModal } from "./editCategoryModal";
import { BulkUploadModal } from "./bulkUploadModal";
import { useCategoryStore } from "@/store/categoryStore";
import { useDebounce } from "@/hooks/use-debounce";
import { categoryService } from "@/services";
import type { Category } from "@/services/category.service";

export function CategoryTab() {
  const {
    categories,
    isLoading,
    fetchCategories,
    reorderCategories,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search,
    parentId,
    complianceRegime,
    active,
    createdAt,
    fromDate,
    toDate,
    setFilters,
    resetFilters,
    deleteCategory,
    toggleCategoryActive,
  } = useCategoryStore(
    useShallow((state) => ({
      categories: state.categories,
      isLoading: state.isLoading,
      fetchCategories: state.fetchCategories,
      reorderCategories: state.reorderCategories,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      parentId: state.parentId,
      complianceRegime: state.complianceRegime,
      active: state.active,
      createdAt: state.createdAt,
      fromDate: state.fromDate,
      toDate: state.toDate,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      deleteCategory: state.deleteCategory,
      toggleCategoryActive: state.toggleCategoryActive,
    }))
  );

  const router = useRouter();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [moveSourceIndex, setMoveSourceIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to delete category");
    }
  };

  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  const isFiltered = !!(
    search ||
    parentId !== "null" ||
    complianceRegime !== undefined ||
    active !== undefined ||
    createdAt !== undefined ||
    fromDate !== undefined ||
    toDate !== undefined
  );

  const activeFiltersCount = [
    parentId !== "null",
    complianceRegime !== undefined,
    active !== undefined,
    createdAt !== undefined,
    (fromDate !== undefined && toDate !== undefined)
  ].filter(Boolean).length;

  const handleDrop = async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const currentDragIndex = dragIndex;
    setDragIndex(null);

    try {
      await reorderCategories(currentDragIndex, dropIndex);
    } catch (err) {
      console.error("Failed to update sort order:", err);
    }
  };


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Category Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Organize the product catalog</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setBulkDialogOpen(true)}
            variant="outline"
            className="border-[#2d7a4f] text-[#2d7a4f] hover:bg-[#2d7a4f]/5 hover:text-[#2d7a4f] gap-1.5 font-semibold cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      {moveSourceIndex !== null && (
        <div className="mb-4 p-3 bg-[#2d7a4f]/10 border border-[#2d7a4f]/20 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-sm text-foreground">
            Moving <span className="font-semibold text-[#2d7a4f]">&quot;{categories[moveSourceIndex]?.name}&quot;</span>. Tap another category to place it there.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMoveSourceIndex(null)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search categories..."
            className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
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
            <div>
              <SheetHeader className="border-b border-border/60 pb-4">
                <SheetTitle className="text-lg font-bold text-foreground">Filter Categories</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Refine the category list by applying multiple criteria.
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Parent Category
                  </label>
                  <Select
                    value={parentId === null ? "__all__" : parentId === "null" ? "__top__" : parentId}
                    onValueChange={(val) => {
                      if (val === "__all__") setFilters({ parentId: null });
                      else if (val === "__top__") setFilters({ parentId: "null" });
                      else setFilters({ parentId: val });
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-lg border border-border/60 bg-background text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="__top__" className="text-sm cursor-pointer">Top-Level Categories Only</SelectItem>
                      <SelectItem value="__all__" className="text-sm cursor-pointer">All Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <Select
                    value={active === undefined ? "__all__" : active ? "true" : "false"}
                    onValueChange={(val) => {
                      if (val === "__all__") setFilters({ active: undefined });
                      else setFilters({ active: val === "true" });
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-lg border border-border/60 bg-background text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="__all__" className="text-sm cursor-pointer">All Statuses</SelectItem>
                      <SelectItem value="true" className="text-sm cursor-pointer">Active Only</SelectItem>
                      <SelectItem value="false" className="text-sm cursor-pointer">Disabled Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Compliance Regime
                  </label>
                  <Select
                    value={complianceRegime === undefined ? "__all__" : complianceRegime}
                    onValueChange={(val) => {
                      if (val === "__all__") setFilters({ complianceRegime: undefined });
                      else setFilters({ complianceRegime: val });
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-lg border border-border/60 bg-background text-sm">
                      <SelectValue placeholder="All Compliance Types" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="__all__" className="text-sm cursor-pointer">All Types</SelectItem>
                      <SelectItem value="fssai_basic" className="text-sm cursor-pointer">FSSAI Basic</SelectItem>
                      <SelectItem value="fssai_state" className="text-sm cursor-pointer">FSSAI State</SelectItem>
                      <SelectItem value="cosmetics_act" className="text-sm cursor-pointer">Cosmetics Act</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => resetFilters()}
                disabled={!isFiltered}
                className="w-1/2 h-10 rounded-lg text-xs font-medium cursor-pointer"
              >
                Reset Filters
              </Button>
              <SheetClose asChild>
                <Button className="w-1/2 h-10 bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-lg text-xs font-medium cursor-pointer">
                  Apply Filters
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Table */}
      <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                    Loading categories…
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                    className={`group hover:bg-muted/20 transition-colors ${moveSourceIndex === idx ? "bg-[#2d7a4f]/10 border-l-4 border-l-[#2d7a4f]" : ""
                      }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing" />
                        <span className="text-xs font-mono text-muted-foreground">{cat.sortOrder}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      <button
                        onClick={() => router.push(`/categories/${cat.id}`)}
                        className="hover:underline hover:text-[#2d7a4f] transition-colors text-left cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-border/80">
                        {cat.complianceRegime}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {(!cat.tags || cat.tags.length === 0) ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : (
                          <>
                            <Badge variant="secondary" className="bg-[#2d7a4f]/10 text-[#2d7a4f] hover:bg-[#2d7a4f]/20 font-medium text-[11px] border border-[#2d7a4f]/20">
                              {cat.tags[0]}
                            </Badge>
                            {cat.tags.length > 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 font-medium text-[10px] cursor-help px-1.5 border border-border/60">
                                      +{cat.tags.length - 1}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="flex flex-col gap-1 p-2">
                                    {cat.tags.slice(1).map(tag => (
                                      <span key={tag} className="text-[11px] font-medium leading-none">{tag}</span>
                                    ))}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge value={cat.active ? "Active" : "Disabled"} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setEditDialogOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCategoryActive(cat.id, !cat.active)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title={cat.active ? "Disable" : "Enable"}
                        >
                          {cat.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
      </div>

      <AddCategoryModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => fetchCategories()}
      />

      <EditCategoryModal
        category={categoryToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdated={() => fetchCategories()}
      />

      <DeleteCategoryModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryName={categoryToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
      />

      <BulkUploadModal
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onUploaded={() => fetchCategories()}
      />
    </div>
  );
}
