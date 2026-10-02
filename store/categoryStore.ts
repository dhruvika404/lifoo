import { create } from "zustand";
import { categoryService } from "@/services";
import type { Category } from "@/services/category.service";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  
  // Filters
  search: string;
  parentId: string | null | undefined;
  complianceRegime: string | undefined;
  active: boolean | undefined;
  createdAt: string | undefined;
  fromDate: string | undefined;
  toDate: string | undefined;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: {
    search?: string;
    parentId?: string | null | undefined;
    complianceRegime?: string | undefined;
    active?: boolean | undefined;
    createdAt?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
  }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  reorderCategories: (draggedIndex: number, overIndex: number) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryActive: (id: string, currentActive: boolean) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  // Default filters
  search: "",
  parentId: "null",
  complianceRegime: undefined,
  active: undefined,
  createdAt: undefined,
  fromDate: undefined,
  toDate: undefined,

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchCategories();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchCategories();
  },

  resetFilters: async () => {
    set({
      search: "",
      parentId: "null",
      complianceRegime: undefined,
      active: undefined,
      createdAt: undefined,
      fromDate: undefined,
      toDate: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchCategories();
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
        parentId,
        complianceRegime,
        active,
        createdAt,
        fromDate,
        toDate,
      } = get();
      
      const showDateFilter = fromDate && toDate;
      const res = await categoryService.getCategories({
        limit,
        parentId: parentId === undefined ? undefined : parentId,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        complianceRegime: complianceRegime || undefined,
        active,
        createdAt: createdAt || undefined,
        fromDate: showDateFilter ? fromDate : undefined,
        toDate: showDateFilter ? toDate : undefined,
      });
      if (res.ok) {
        let items: Category[] = [];
        let nextCursor: string | null = null;
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && typeof res.data === "object" && "items" in res.data) {
          items = res.data.items;
          nextCursor = res.data.nextCursor || null;
        }
        set({ categories: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch categories" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; // Ignore 401 errors as they are handled globally by the API interceptor
      }
      console.error("[useCategoryStore] fetchCategories error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch categories";
      set({ error: errMsg });
    } finally {
      set({ isLoading: false });
    }
  },

  goToNextPage: async () => {
    const { nextCursor, currentPageCursor, history } = get();
    if (!nextCursor) return;
    set({
      history: [...history, currentPageCursor],
      currentPageCursor: nextCursor,
    });
    await get().fetchCategories();
  },

  goToPreviousPage: async () => {
    const { history } = get();
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevCursor = newHistory.pop()!;
    set({
      history: newHistory,
      currentPageCursor: prevCursor,
    });
    await get().fetchCategories();
  },

  reorderCategories: async (draggedIndex: number, overIndex: number) => {
    const { categories, limit, history } = get();
    if (draggedIndex === overIndex) return;

    // Optimistically reorder in UI
    const reordered = [...categories];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(overIndex, 0, moved);
    set({ categories: reordered });

    try {
      // Construct the reorder payload with new sortOrder (1-based index, adjusted for page)
      const pageOffset = history.length * limit;
      const payload = {
        updates: reordered.map((cat, index) => ({
          id: cat.id,
          sortOrder: pageOffset + index + 1,
        })),
      };

      await categoryService.reorderCategories(payload);
    } catch (err: any) {
      console.error("[useCategoryStore] reorderCategories error:", err);
      // Revert to original order on failure
      await get().fetchCategories();
      throw err;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.ok) {
        await get().fetchCategories();
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err; // Let the interceptor handle the redirect, but don't log/set error in store
      }
      console.error("[useCategoryStore] deleteCategory error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete category";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCategoryActive: async (id: string, currentActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const res = await categoryService.updateCategory(id, { active: !currentActive });
      if (res.ok) {
        await get().fetchCategories();
      } else {
        throw new Error("Failed to update category status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useCategoryStore] toggleCategoryActive error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update category status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
