import { create } from "zustand";
import { cuisineService, Cuisine } from "@/services/cuisine.service";

interface CuisineState {
  cuisines: Cuisine[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  
  // Filters
  search: string;
  active: boolean | undefined;
  createdAt: string | undefined;
  fromDate: string | undefined;
  toDate: string | undefined;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: {
    search?: string;
    active?: boolean | undefined;
    createdAt?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
  }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchCuisines: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  deleteCuisine: (id: string) => Promise<void>;
  toggleCuisineActive: (id: string, currentActive: boolean) => Promise<void>;
  reorderCuisines: (sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const useCuisineStore = create<CuisineState>((set, get) => ({
  cuisines: [],
  isLoading: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  // Default filters
  search: "",
  active: undefined,
  createdAt: undefined,
  fromDate: undefined,
  toDate: undefined,

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchCuisines();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchCuisines();
  },

  resetFilters: async () => {
    set({
      search: "",
      active: undefined,
      createdAt: undefined,
      fromDate: undefined,
      toDate: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchCuisines();
  },

  fetchCuisines: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
      } = get();
      
      const res = await cuisineService.getCuisines({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
      });
      if (res.ok) {
        let items: Cuisine[] = [];
        let nextCursor: string | null = null;
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && typeof res.data === "object" && "items" in res.data) {
          items = res.data.items;
          nextCursor = res.data.nextCursor || null;
        }
        set({ cuisines: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch cuisines" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; 
      }
      console.error("[useCuisineStore] fetchCuisines error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch cuisines";
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
    await get().fetchCuisines();
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
    await get().fetchCuisines();
  },

  deleteCuisine: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await cuisineService.deleteCuisine(id);
      if (res.ok) {
        await get().fetchCuisines();
      } else {
        throw new Error("Failed to delete cuisine");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err; 
      }
      console.error("[useCuisineStore] deleteCuisine error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete cuisine";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCuisineActive: async (id: string, currentActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const res = await cuisineService.updateCuisine(id, { active: !currentActive });
      if (res.ok) {
        await get().fetchCuisines();
      } else {
        throw new Error("Failed to update cuisine status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useCuisineStore] toggleCuisineActive error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update cuisine status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reorderCuisines: async (sourceIndex: number, destinationIndex: number) => {
    const { cuisines } = get();
    const newCuisines = Array.from(cuisines);
    const [movedItem] = newCuisines.splice(sourceIndex, 1);
    newCuisines.splice(destinationIndex, 0, movedItem);

    // Optimistically update UI
    set({ cuisines: newCuisines });

    try {
      // Calculate sortOrders based on indices and update those that changed
      const updatePromises = newCuisines.map((c, index) => {
        const newSortOrder = index + 1;
        if (c.sortOrder !== newSortOrder) {
          c.sortOrder = newSortOrder; // Optimistically update in memory
          return cuisineService.updateCuisine(c.id, { sortOrder: newSortOrder });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("[useCuisineStore] reorderCuisines error:", err);
      // Revert on error
      set({ cuisines });
      throw err;
    }
  },
}));
