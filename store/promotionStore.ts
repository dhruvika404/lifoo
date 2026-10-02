import { create } from "zustand";
import { promotionService, Promotion, CreatePromotionPayload, UpdatePromotionPayload } from "@/services/promotion.service";

interface PromotionState {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  
  // Filters
  search: string;
  promotionType: string | undefined;
  displayType: string | undefined;
  isActive: boolean | undefined;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: {
    search?: string;
    promotionType?: string | undefined;
    displayType?: string | undefined;
    isActive?: boolean | undefined;
  }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchPromotions: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  createPromotion: (payload: CreatePromotionPayload) => Promise<Promotion>;
  updatePromotion: (id: string, payload: UpdatePromotionPayload) => Promise<Promotion>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotionActive: (id: string, currentActive: boolean) => Promise<void>;
  togglePromotionStackable: (id: string, currentStackable: boolean) => Promise<void>;
}

export const usePromotionStore = create<PromotionState>((set, get) => ({
  promotions: [],
  isLoading: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  // Default filters
  search: "",
  promotionType: undefined,
  displayType: undefined,
  isActive: undefined,

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchPromotions();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchPromotions();
  },

  resetFilters: async () => {
    set({
      search: "",
      promotionType: undefined,
      displayType: undefined,
      isActive: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchPromotions();
  },

  fetchPromotions: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
        promotionType,
        displayType,
        isActive,
      } = get();
      
      const res = await promotionService.getPromotions({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        promotionType: promotionType || undefined,
        displayType: displayType || undefined,
        isActive: isActive,
      });

      if (res.ok) {
        let items: Promotion[] = [];
        let nextCursor: string | null = null;
        if (res.data && typeof res.data === "object") {
          items = res.data.items || [];
          nextCursor = res.data.nextCursor || null;
        }
        set({ promotions: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch promotions" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; 
      }
      console.error("[usePromotionStore] fetchPromotions error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch promotions";
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
    await get().fetchPromotions();
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
    await get().fetchPromotions();
  },

  createPromotion: async (payload: CreatePromotionPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await promotionService.createPromotion(payload);
      if (res.ok) {
        await get().fetchPromotions();
        return res.data;
      } else {
        throw new Error("Failed to create promotion");
      }
    } catch (err: any) {
      console.error("[usePromotionStore] createPromotion error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to create promotion";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePromotion: async (id: string, payload: UpdatePromotionPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await promotionService.updatePromotion(id, payload);
      if (res.ok) {
        await get().fetchPromotions();
        return res.data;
      } else {
        throw new Error("Failed to update promotion");
      }
    } catch (err: any) {
      console.error("[usePromotionStore] updatePromotion error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update promotion";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePromotion: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await promotionService.deletePromotion(id);
      if (res.ok) {
        await get().fetchPromotions();
      } else {
        throw new Error("Failed to delete promotion");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[usePromotionStore] deletePromotion error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete promotion";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  togglePromotionActive: async (id: string, currentActive: boolean) => {
    // Optimistically update status in memory
    const originalPromotions = get().promotions;
    set({
      promotions: originalPromotions.map((p) =>
        p.id === id ? { ...p, isActive: !currentActive } : p
      ),
    });

    try {
      const res = await promotionService.updatePromotion(id, { isActive: !currentActive });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      // Re-fetch to ensure sync with server
      await get().fetchPromotions();
    } catch (err: any) {
      // Revert optimism on error
      set({ promotions: originalPromotions });
      console.error("[usePromotionStore] togglePromotionActive error:", err);
      throw err;
    }
  },

  togglePromotionStackable: async (id: string, currentStackable: boolean) => {
    // Optimistically update status in memory
    const originalPromotions = get().promotions;
    set({
      promotions: originalPromotions.map((p) =>
        p.id === id ? { ...p, isStackable: !currentStackable } : p
      ),
    });

    try {
      const res = await promotionService.updatePromotion(id, { isStackable: !currentStackable });
      if (!res.ok) {
        throw new Error("Failed to update stackable status");
      }
      // Re-fetch to ensure sync with server
      await get().fetchPromotions();
    } catch (err: any) {
      // Revert optimism on error
      set({ promotions: originalPromotions });
      console.error("[usePromotionStore] togglePromotionStackable error:", err);
      throw err;
    }
  },
}));
