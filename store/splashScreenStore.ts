import { create } from "zustand";
import {
  splashScreenService,
  SplashScreen,
  CreateSplashScreenPayload,
  UpdateSplashScreenPayload,
  TargetPlatform,
  TargetAudience,
} from "@/services/splashScreen.service";

interface SplashScreenFilters {
  search?: string;
  isActive?: boolean | undefined;
  targetPlatform?: TargetPlatform | undefined;
  targetAudience?: TargetAudience | undefined;
}

interface SplashScreenState {
  // State
  splashScreens: SplashScreen[];
  isLoading: boolean;
  isReordering: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];

  // Filters
  search: string;
  isActiveFilter: boolean | undefined;
  targetPlatformFilter: TargetPlatform | undefined;
  targetAudienceFilter: TargetAudience | undefined;

  // Actions
  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: SplashScreenFilters) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchSplashScreens: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  createSplashScreen: (payload: CreateSplashScreenPayload) => Promise<void>;
  updateSplashScreen: (id: string, payload: UpdateSplashScreenPayload) => Promise<void>;
  toggleActive: (id: string, currentStatus: boolean, item?: SplashScreen) => Promise<void>;
  reorderSplashScreens: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  deleteSplashScreen: (id: string) => Promise<void>;
}

export const useSplashScreenStore = create<SplashScreenState>((set, get) => ({
  splashScreens: [],
  isLoading: false,
  isReordering: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  search: "",
  isActiveFilter: undefined,
  targetPlatformFilter: undefined,
  targetAudienceFilter: undefined,

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchSplashScreens();
  },

  setFilters: async (filters) => {
    set({
      ...(filters.search !== undefined && { search: filters.search }),
      ...(filters.isActive !== undefined && { isActiveFilter: filters.isActive }),
      ...(filters.targetPlatform !== undefined && { targetPlatformFilter: filters.targetPlatform }),
      ...(filters.targetAudience !== undefined && { targetAudienceFilter: filters.targetAudience }),
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchSplashScreens();
  },

  resetFilters: async () => {
    set({
      search: "",
      isActiveFilter: undefined,
      targetPlatformFilter: undefined,
      targetAudienceFilter: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchSplashScreens();
  },

  fetchSplashScreens: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
        isActiveFilter,
        targetPlatformFilter,
        targetAudienceFilter,
      } = get();

      const res = await splashScreenService.getSplashScreens({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        isActive: isActiveFilter,
        targetPlatform: targetPlatformFilter || undefined,
        targetAudience: targetAudienceFilter || undefined,
      });

      const raw = res as any;
      let items: SplashScreen[] = [];
      let nextCursor: string | null = null;

      if (raw?.data?.items && Array.isArray(raw.data.items)) {
        items = raw.data.items;
        nextCursor = raw.data.nextCursor ?? null;
      } else if (raw?.items && Array.isArray(raw.items)) {
        items = raw.items;
        nextCursor = raw.nextCursor ?? null;
      } else if (Array.isArray(raw?.data)) {
        items = raw.data;
      } else if (Array.isArray(raw)) {
        items = raw;
      }

      set({
        splashScreens: items,
        nextCursor,
        error: null,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[useSplashScreenStore] fetchSplashScreens error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to fetch splash screens";
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
    await get().fetchSplashScreens();
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
    await get().fetchSplashScreens();
  },

  createSplashScreen: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await splashScreenService.createSplashScreen(payload);
      if (res.ok) {
        await get().fetchSplashScreens();
      } else {
        throw new Error("Failed to create splash screen");
      }
    } catch (err: any) {
      console.error("[useSplashScreenStore] createSplashScreen error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSplashScreen: async (id, payload) => {
    try {
      const res = await splashScreenService.updateSplashScreen(id, payload);
      if (res.ok && res.data) {
        set((state) => ({
          splashScreens: state.splashScreens.map((s) => (s.id === id ? res.data : s)),
        }));
      } else {
        // Fallback: refresh list if returned item was partial
        await get().fetchSplashScreens();
      }
    } catch (err: any) {
      console.error("[useSplashScreenStore] updateSplashScreen error:", err);
      throw err;
    }
  },

  toggleActive: async (id, currentStatus, item) => {
    const nextStatus = !currentStatus;
    // Optimistic update
    set((state) => ({
      splashScreens: state.splashScreens.map((s) =>
        s.id === id ? { ...s, isActive: nextStatus } : s
      ),
    }));

    try {
      const payload: UpdateSplashScreenPayload = {
        isActive: nextStatus,
        ...(item && {
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          imageUrl: item.imageUrl,
          displayOrder: item.displayOrder,
          targetPlatform: item.targetPlatform,
          targetAudience: item.targetAudience,
        }),
      };
      await splashScreenService.updateSplashScreen(id, payload);
    } catch (err: any) {
      // Revert optimistic update
      set((state) => ({
        splashScreens: state.splashScreens.map((s) =>
          s.id === id ? { ...s, isActive: currentStatus } : s
        ),
      }));
      console.error("[useSplashScreenStore] toggleActive error:", err);
      throw err;
    }
  },

  reorderSplashScreens: async (sourceIndex: number, destinationIndex: number) => {
    const { splashScreens } = get();
    if (sourceIndex === destinationIndex) return;

    const reordered = [...splashScreens];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, moved);

    // Re-assign displayOrder (1-based)
    const updatedScreens = reordered.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    // Optimistic update
    set({ splashScreens: updatedScreens, isReordering: true });

    try {
      const payload = {
        items: updatedScreens.map((item) => ({
          id: item.id,
          displayOrder: item.displayOrder,
        })),
      };
      await splashScreenService.reorderSplashScreens(payload);
    } catch (err: any) {
      console.error("[useSplashScreenStore] reorderSplashScreens error:", err);
      // Revert back on error
      set({ splashScreens });
      throw err;
    } finally {
      set({ isReordering: false });
    }
  },

  deleteSplashScreen: async (id: string) => {
    try {
      const res = await splashScreenService.deleteSplashScreen(id);
      if (res.ok) {
        set((state) => ({
          splashScreens: state.splashScreens.filter((s) => s.id !== id),
        }));
      } else {
        throw new Error("Failed to delete splash screen");
      }
    } catch (err: any) {
      console.error("[useSplashScreenStore] deleteSplashScreen error:", err);
      throw err;
    }
  },
}));
