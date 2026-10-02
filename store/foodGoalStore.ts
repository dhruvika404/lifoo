import { create } from "zustand";
import { foodGoalService, FoodGoal } from "@/services/food-goal.service";

interface FoodGoalState {
  foodGoals: FoodGoal[];
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
  fetchFoodGoals: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  deleteFoodGoal: (id: string) => Promise<void>;
  toggleFoodGoalActive: (id: string, currentActive: boolean) => Promise<void>;
  reorderFoodGoals: (sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const useFoodGoalStore = create<FoodGoalState>((set, get) => ({
  foodGoals: [],
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
    await get().fetchFoodGoals();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchFoodGoals();
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
    await get().fetchFoodGoals();
  },

  fetchFoodGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        limit,
        currentPageCursor,
        search,
      } = get();
      
      const res = await foodGoalService.getFoodGoals({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
      });
      if (res.ok) {
        let items: FoodGoal[] = [];
        let nextCursor: string | null = null;
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && typeof res.data === "object" && "items" in res.data) {
          items = res.data.items;
          nextCursor = res.data.nextCursor || null;
        }
        set({ foodGoals: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch food goals" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; 
      }
      console.error("[useFoodGoalStore] fetchFoodGoals error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch food goals";
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
    await get().fetchFoodGoals();
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
    await get().fetchFoodGoals();
  },

  deleteFoodGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await foodGoalService.deleteFoodGoal(id);
      if (res.ok) {
        await get().fetchFoodGoals();
      } else {
        throw new Error("Failed to delete food goal");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err; 
      }
      console.error("[useFoodGoalStore] deleteFoodGoal error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete food goal";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFoodGoalActive: async (id: string, currentActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const res = await foodGoalService.updateFoodGoal(id, { active: !currentActive });
      if (res.ok) {
        await get().fetchFoodGoals();
      } else {
        throw new Error("Failed to update food goal status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useFoodGoalStore] toggleFoodGoalActive error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update food goal status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reorderFoodGoals: async (sourceIndex: number, destinationIndex: number) => {
    const { foodGoals } = get();
    const newFoodGoals = Array.from(foodGoals);
    const [movedItem] = newFoodGoals.splice(sourceIndex, 1);
    newFoodGoals.splice(destinationIndex, 0, movedItem);

    // Optimistically update UI
    set({ foodGoals: newFoodGoals });

    try {
      const updatePromises = newFoodGoals.map((c, index) => {
        const newSortOrder = index + 1;
        if (c.sortOrder !== newSortOrder) {
          c.sortOrder = newSortOrder;
          return foodGoalService.updateFoodGoal(c.id, { sortOrder: newSortOrder });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("[useFoodGoalStore] reorderFoodGoals error:", err);
      set({ foodGoals });
      throw err;
    }
  },
}));
