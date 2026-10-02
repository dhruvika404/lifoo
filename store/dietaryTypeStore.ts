import { create } from "zustand";
import { dietaryTypeService, DietaryType } from "@/services/dietary-type.service";

interface DietaryTypeState {
  dietaryTypes: DietaryType[];
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
  fetchDietaryTypes: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  deleteDietaryType: (id: string) => Promise<void>;
  toggleDietaryTypeActive: (id: string, currentActive: boolean) => Promise<void>;
  reorderDietaryTypes: (sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const useDietaryTypeStore = create<DietaryTypeState>((set, get) => ({
  dietaryTypes: [],
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
    await get().fetchDietaryTypes();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchDietaryTypes();
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
    await get().fetchDietaryTypes();
  },

  fetchDietaryTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
      } = get();
      
      const res = await dietaryTypeService.getDietaryTypes({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
      });
      if (res.ok) {
        let items: DietaryType[] = [];
        let nextCursor: string | null = null;
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && typeof res.data === "object" && "items" in res.data) {
          items = res.data.items;
          nextCursor = res.data.nextCursor || null;
        }
        set({ dietaryTypes: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch dietary types" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; 
      }
      console.error("[useDietaryTypeStore] fetchDietaryTypes error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch dietary types";
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
    await get().fetchDietaryTypes();
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
    await get().fetchDietaryTypes();
  },

  deleteDietaryType: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await dietaryTypeService.deleteDietaryType(id);
      if (res.ok) {
        await get().fetchDietaryTypes();
      } else {
        throw new Error("Failed to delete dietary type");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err; 
      }
      console.error("[useDietaryTypeStore] deleteDietaryType error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete dietary type";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleDietaryTypeActive: async (id: string, currentActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const res = await dietaryTypeService.updateDietaryType(id, { active: !currentActive });
      if (res.ok) {
        await get().fetchDietaryTypes();
      } else {
        throw new Error("Failed to update dietary type status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useDietaryTypeStore] toggleDietaryTypeActive error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update dietary type status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reorderDietaryTypes: async (sourceIndex: number, destinationIndex: number) => {
    const { dietaryTypes } = get();
    const newDietaryTypes = Array.from(dietaryTypes);
    const [movedItem] = newDietaryTypes.splice(sourceIndex, 1);
    newDietaryTypes.splice(destinationIndex, 0, movedItem);

    // Optimistically update UI
    set({ dietaryTypes: newDietaryTypes });

    try {
      // Calculate sortOrders based on indices and update those that changed
      const updatePromises = newDietaryTypes.map((c, index) => {
        const newSortOrder = index + 1;
        if (c.sortOrder !== newSortOrder) {
          c.sortOrder = newSortOrder; // Optimistically update in memory
          return dietaryTypeService.updateDietaryType(c.id, { sortOrder: newSortOrder });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("[useDietaryTypeStore] reorderDietaryTypes error:", err);
      // Revert on error
      set({ dietaryTypes });
      throw err;
    }
  },
}));
