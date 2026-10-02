"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryService } from "@/services";
import { PageHeader, PageBody } from "@/components/pageShell";
import { getS3ImageUrl } from "@/lib/s3-utils";
import type { Category } from "@/services/category.service";
import { StatusBadge } from "@/components/pageShell";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowLeft,
  FolderOpen,
  Info,
  Loader2,
  Search,
  Shield,
  Layers,
  GripVertical,
  Package,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  MousePointerClick,
  MoreVertical
} from "lucide-react";
import toast from "react-hot-toast";
import { EditCategoryModal } from "./editCategoryModal";
import { DeleteCategoryModal } from "./deleteCategoryModal";
import { ViewCategoryModal } from "./viewCategoryModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ProductsPanel({
  targetCategoryId,
  title,
  subtitle,
  onClearSelection
}: {
  targetCategoryId: string;
  title: string;
  subtitle?: string;
  onClearSelection?: () => void;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragProductIndex, setDragProductIndex] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  const loadProducts = async (cursor?: string) => {
    setLoading(true);
    try {
      const res = await categoryService.getCategoryProducts(targetCategoryId, {
        limit: 10,
        ...(cursor ? { cursor } : {})
      });
      if (res && res.data) {
        let items: any[] = [];
        if (Array.isArray(res.data)) {
          items = res.data;
          setNextCursor(null);
        } else if (res.data.items) {
          items = res.data.items;
          setNextCursor(res.data.nextCursor || null);
        }
        setProducts(items);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursorHistory([]);
    setNextCursor(null);
    loadProducts();
  }, [targetCategoryId]);

  const handleNextPage = () => {
    if (nextCursor) {
      const currentCursor = cursorHistory.length > 0 ? cursorHistory[cursorHistory.length - 1] : undefined;
      setCursorHistory([...cursorHistory, nextCursor]);
      loadProducts(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      newHistory.pop();
      const prevCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
      setCursorHistory(newHistory);
      loadProducts(prevCursor);
    }
  };

  const handleProductDrop = async (dropIndex: number) => {
    if (dragProductIndex === null || dragProductIndex === dropIndex) return;
    const currentDragIndex = dragProductIndex;
    const reordered = [...products];
    const [moved] = reordered.splice(currentDragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    setProducts(reordered);
    setDragProductIndex(null);

    const prevProduct = dropIndex > 0 ? reordered[dropIndex - 1] : null;
    const nextProduct = dropIndex < reordered.length - 1 ? reordered[dropIndex + 1] : null;
    const prevSortOrder = prevProduct?.sortOrder ?? null;
    const nextSortOrder = nextProduct?.sortOrder ?? null;

    try {
      await categoryService.reorderCategoryProduct(targetCategoryId, moved.id, {
        prevSortOrder,
        nextSortOrder
      });
      toast.success("Product order updated");
      loadProducts();
    } catch (err) {
      console.error("Failed to reorder product", err);
      toast.error("Failed to update product order");
      loadProducts();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/60 shrink-0 bg-muted/5 flex items-center justify-between min-h-[72px] gap-4">
        <div className="flex flex-col justify-center">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-base line-clamp-1">
            <Package className="h-4 w-4 text-[#2d7a4f] shrink-0" /> <span className="truncate">{title} ({products.length})</span>
          </h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{subtitle}</p>}
        </div>
        {onClearSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="text-xs h-8 px-3 shrink-0"
          >
            View Direct Products
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="py-2.5 px-4 font-medium text-center w-12">Order</th>
              <th className="py-2.5 px-4 font-medium">Product</th>
              <th className="py-2.5 px-4 font-medium">Chef</th>
              <th className="py-2.5 px-4 font-medium">Price</th>
              <th className="py-2.5 px-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-3" />
                  <p className="text-sm">Loading products...</p>
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product, idx) => (
                <tr
                  key={product.id}
                  draggable
                  onDragStart={() => {
                    setDragProductIndex(idx);
                  }}
                  onDragEnd={() => setDragProductIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleProductDrop(idx)}
                  className={`group hover:bg-muted/20 transition-colors cursor-grab`}
                >
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing" />
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-muted-foreground text-xs">{product.chefDisplayName || product.chefBusinessName || 'N/A'}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-foreground">
                      {product.basePricePaisa ? `₹${(product.basePricePaisa / 100).toFixed(2)}` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <StatusBadge value={product.status || 'draft'} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm">No products found here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border/60 shrink-0 text-xs text-muted-foreground flex items-center justify-between bg-muted/10">
        <span>Showing {products.length} products {cursorHistory.length > 0 ? `(Page ${cursorHistory.length + 1})` : ''}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={handlePrevPage}
            disabled={cursorHistory.length === 0 || loading}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={handleNextPage}
            disabled={!nextCursor || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CategoryDetailsPage({ categoryId }: { categoryId: string }) {
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragSubCatIndex, setDragSubCatIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState<Category | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!categoryId) return;

    const loadCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailRes = await categoryService.getCategory(categoryId);
        if (detailRes.ok && detailRes.data) {
          setCategory(detailRes.data);

          // Fetch parent category if exists
          if (detailRes.data.parentId) {
            const parentRes = await categoryService.getCategory(detailRes.data.parentId);
            if (parentRes.ok && parentRes.data) {
              setParentCategory(parentRes.data);
            }
          }
        } else {
          throw new Error("Failed to load category details");
        }
      } catch (err: any) {
        console.error("Error loading category details:", err);
        setError(err.message || "An error occurred while loading category details.");
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  const loadSubcategories = async () => {
    if (!categoryId) return;
    setSubLoading(true);
    try {
      const res = await categoryService.getCategories({
        limit: 100,
        parentId: categoryId,
        search: debouncedSearchQuery || undefined
      });

      if (res.ok) {
        let items: Category[] = [];
        if (res.data) {
          if (Array.isArray(res.data)) {
            items = res.data;
          } else if (typeof res.data === "object" && "items" in res.data) {
            items = res.data.items;
          }
        }
        setSubcategories(items);
        if (activeSubcategory && !items.find(i => i.id === activeSubcategory.id)) {
          setActiveSubcategory(null);
        }
      }
    } catch (err) {
      console.error("Failed to load subcategories", err);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    loadSubcategories();
  }, [categoryId, debouncedSearchQuery]);

  const toggleSubcategoryActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await categoryService.updateCategory(id, { active: !currentActive });
      if (res.ok) {
        toast.success(`Subcategory ${currentActive ? 'disabled' : 'enabled'} successfully`);
        loadSubcategories();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update subcategory status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success(`Subcategory "${categoryToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      loadSubcategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to delete subcategory");
    }
  };

  const handleSubcategoryDrop = async (dropIndex: number) => {
    if (dragSubCatIndex === null || dragSubCatIndex === dropIndex) return;
    const currentDragIndex = dragSubCatIndex;
    const reordered = [...subcategories];
    const [moved] = reordered.splice(currentDragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    setSubcategories(reordered);
    setDragSubCatIndex(null);

    try {
      const payload = {
        updates: reordered.map((cat, index) => ({
          id: cat.id,
          sortOrder: index + 1,
        })),
      };
      await categoryService.reorderCategories(payload);
      toast.success("Subcategory order updated");
      loadSubcategories();
    } catch (err) {
      console.error("Failed to reorder subcategories", err);
      toast.error("Failed to update subcategory order");
      loadSubcategories();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f]" />
          <p className="text-sm text-muted-foreground font-medium">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="px-6 py-4 bg-card border-b border-border/60">
          <Button variant="ghost" onClick={() => router.push("/categories")} className="mb-2 -ml-3 gap-1.5 h-8 text-muted-foreground hover:text-foreground cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
              <Info className="h-6 w-6" />
              <p className="font-medium">{error || "Category not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background/50 overflow-hidden">
      <div className="bg-card border-b border-border/60 px-6 py-4 flex flex-col shadow-sm z-10 shrink-0">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/categories")} className="-ml-3 h-8 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer font-medium">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center shadow-sm">
            {category.imageUrl ? (
              <img src={getS3ImageUrl(category.imageUrl) || ""} alt={category.name} className="h-full w-full object-cover" />
            ) : (
              <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate leading-none">{category.name}</h1>
              <StatusBadge value={category.active ? "Active" : "Disabled"} />
            </div>

            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 max-w-4xl mb-2">{category.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-mono text-[10px] sm:text-xs bg-muted px-1.5 py-0.5 rounded-md border border-border/60">/{category.slug}</span>
              </div>
              <span className="text-muted-foreground/30 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-foreground">
                <FolderOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                <span className="font-medium truncate max-w-[150px]">{parentCategory ? parentCategory.name : "Top-Level Category"}</span>
              </div>
              <span className="text-muted-foreground/30 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-foreground">
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                <span className="font-medium">{category.complianceRegime || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

          <div className="flex flex-col h-full bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden relative">
            <div className="p-4 border-b border-border/60 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/5 min-h-[72px]">
              <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                <Layers className="h-4 w-4 text-[#2d7a4f]" />
                Subcategories ({subcategories.length})
              </div>
              <div className="relative w-full sm:max-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search subcats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs border-border/60 focus-visible:ring-[#2d7a4f]/20 bg-background"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-2.5 px-4 font-medium text-center w-12">Order</th>
                    <th className="py-2.5 px-4 font-medium">Name</th>
                    <th className="py-2.5 px-4 font-medium">Slug</th>
                    <th className="py-2.5 px-4 font-medium">Tags</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {subLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-3" />
                        <p className="text-sm">Loading subcategories...</p>
                      </td>
                    </tr>
                  ) : subcategories.length > 0 ? (
                    subcategories.map((subCat, idx) => {
                      const isActive = activeSubcategory?.id === subCat.id;
                      return (
                        <tr
                          key={subCat.id}
                          draggable
                          onDragStart={() => {
                            setDragSubCatIndex(idx);
                          }}
                          onDragEnd={() => setDragSubCatIndex(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleSubcategoryDrop(idx)}
                          onClick={() => {
                            setActiveSubcategory(isActive ? null : subCat);
                          }}
                          className={`group cursor-pointer transition-colors ${isActive ? "bg-primary/5 border-l-4 border-l-primary" :
                            "hover:bg-muted/30 border-l-4 border-transparent"
                            }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing" />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`group-hover:underline transition-colors text-left font-medium ${isActive ? 'text-[#2d7a4f]' : 'text-foreground'}`}
                            >
                              {subCat.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                            {subCat.slug}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {(!subCat.tags || subCat.tags.length === 0) ? (
                                <span className="text-muted-foreground text-xs">—</span>
                              ) : (
                                <>
                                  <Badge variant="secondary" className="bg-[#2d7a4f]/10 text-[#2d7a4f] hover:bg-[#2d7a4f]/20 font-medium text-[11px] border border-[#2d7a4f]/20">
                                    {subCat.tags[0]}
                                  </Badge>
                                  {subCat.tags.length > 1 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 font-medium text-[10px] cursor-help px-1.5 border border-border/60">
                                            +{subCat.tags.length - 1}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="flex flex-col gap-1 p-2">
                                          {subCat.tags.slice(1).map(tag => (
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
                            <StatusBadge value={subCat.active ? "Active" : "Disabled"} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border border-border bg-card">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryToView(subCat);
                                    setViewDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-sm gap-2"
                                >
                                  <FolderOpen className="h-4 w-4 text-muted-foreground" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryToEdit(subCat);
                                    setEditDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-sm gap-2"
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubcategoryActive(subCat.id, subCat.active);
                                  }}
                                  className="cursor-pointer text-sm gap-2"
                                >
                                  {subCat.active ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                  {subCat.active ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryToDelete(subCat);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-sm gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm bg-muted/10 h-full">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Layers className="h-8 w-8 text-muted-foreground/30" />
                          <p>{debouncedSearchQuery ? "No subcategories found matching search." : "No subcategories mapped under this category."}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border/60 shrink-0 text-xs text-muted-foreground flex items-center justify-between bg-muted/10">
              <span className="flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5" /> Click a row to view its products
              </span>
              <div className="flex items-center gap-1 opacity-50 pointer-events-none">
                <Button variant="outline" size="sm" className="h-7 px-2"><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <ProductsPanel
            targetCategoryId={activeSubcategory ? activeSubcategory.id : category.id}
            title={activeSubcategory ? `${activeSubcategory.name} Products` : "Direct Products"}
            subtitle={activeSubcategory ? "Products mapped to this subcategory" : "Products mapped directly to this category"}
            onClearSelection={activeSubcategory ? () => setActiveSubcategory(null) : undefined}
          />

        </div>
      </div>

      <EditCategoryModal
        category={categoryToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdated={() => loadSubcategories()}
      />

      <DeleteCategoryModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoryName={categoryToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
      />

      <ViewCategoryModal
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        category={categoryToView}
      />
    </div>
  );
}