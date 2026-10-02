import { create } from "zustand";
import { tastePreferenceService, TastePreference } from "@/services/taste-preference.service";

interface TastePreferenceState {
  tastePreferences: TastePreference[];
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

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: {
    search?: string;
    active?: boolean | undefined;
    createdAt?: string | undefined;
  }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchTastePreferences: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  deleteTastePreference: (id: string) => Promise<void>;
  toggleTastePreferenceActive: (id: string, currentActive: boolean) => Promise<void>;
  reorderTastePreferences: (sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const useTastePreferenceStore = create<TastePreferenceState>((set, get) => ({
  tastePreferences: [],
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

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchTastePreferences();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchTastePreferences();
  },

  resetFilters: async () => {
    set({
      search: "",
      active: undefined,
      createdAt: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchTastePreferences();
  },

  fetchTastePreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
      } = get();
      
      const res = await tastePreferenceService.getTastePreferences({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
      });
      if (res.ok) {
        let items: TastePreference[] = [];
        let nextCursor: string | null = null;
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && typeof res.data === "object" && "items" in res.data) {
          items = res.data.items;
          nextCursor = res.data.nextCursor || null;
        }
        set({ tastePreferences: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch taste preferences" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; 
      }
      console.error("[useTastePreferenceStore] fetchTastePreferences error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch taste preferences";
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
    await get().fetchTastePreferences();
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
    await get().fetchTastePreferences();
  },

  deleteTastePreference: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await tastePreferenceService.deleteTastePreference(id);
      if (res.ok) {
        await get().fetchTastePreferences();
      } else {
        throw new Error("Failed to delete taste preference");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err; 
      }
      console.error("[useTastePreferenceStore] deleteTastePreference error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete taste preference";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleTastePreferenceActive: async (id: string, currentActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const res = await tastePreferenceService.updateTastePreference(id, { active: !currentActive });
      if (res.ok) {
        await get().fetchTastePreferences();
      } else {
        throw new Error("Failed to update taste preference status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useTastePreferenceStore] toggleTastePreferenceActive error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update taste preference status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reorderTastePreferences: async (sourceIndex: number, destinationIndex: number) => {
    const { tastePreferences } = get();
    const newTastePreferences = Array.from(tastePreferences);
    const [movedItem] = newTastePreferences.splice(sourceIndex, 1);
    newTastePreferences.splice(destinationIndex, 0, movedItem);

    // Optimistically update UI
    set({ tastePreferences: newTastePreferences });

    try {
      const updatePromises = newTastePreferences.map((c, index) => {
        const newSortOrder = index + 1;
        if (c.sortOrder !== newSortOrder) {
          c.sortOrder = newSortOrder;
          return tastePreferenceService.updateTastePreference(c.id, { sortOrder: newSortOrder });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("[useTastePreferenceStore] reorderTastePreferences error:", err);
      set({ tastePreferences });
      throw err;
    }
  },
}));
