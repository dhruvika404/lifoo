import { create } from "zustand";
import { productService } from "@/services/product.service";
import type { Product } from "@/services/product.service";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  
  // Filters
  search: string;
  status: string | undefined;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: {
    search?: string;
    status?: string | undefined;
  }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  updateProductStatus: (id: string, newStatus: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  // Default filters
  search: "",
  status: undefined,

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchProducts();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchProducts();
  },

  resetFilters: async () => {
    set({
      search: "",
      status: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
        status,
      } = get();
      
      const res = await productService.getProducts({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        status: status || undefined,
      });
      if (res.ok) {
        let items: Product[] = [];
        let nextCursor: string | null = null;
        if (res.data && res.data.items) {
          items = res.data.items;
          nextCursor = res.data.nextCursor || null;
        }
        set({ products: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch products" });
      }
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (err?.response?.status === 401) {
        return;
      }
      console.error("[useProductStore] fetchProducts error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch products";
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
    await get().fetchProducts();
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
    await get().fetchProducts();
  },

  updateProductStatus: async (id: string, newStatus: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await productService.updateProductStatus(id, { status: newStatus });
      if (res.ok) {
        await get().fetchProducts();
      } else {
        throw new Error("Failed to update product status");
      }
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useProductStore] updateProductStatus error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update product status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
