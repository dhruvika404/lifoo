import { create } from "zustand";
import { financeService, PayoutRequest } from "@/services/finance.service";

interface FinanceState {
  payouts: PayoutRequest[];
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // Pagination & Filters
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  search: string;
  status: string;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: { search?: string; status?: string }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchPayouts: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  updatePayoutStatus: (id: string, status: "processing" | "completed" | "failed", notes?: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  payouts: [],
  total: 0,
  isLoading: false,
  error: null,

  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],
  search: "",
  status: "all",

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchPayouts();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchPayouts();
  },

  resetFilters: async () => {
    set({
      search: "",
      status: "all",
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchPayouts();
  },

  fetchPayouts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, status } = get();

      const res = await financeService.getPayouts({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res.ok) {
        const nextIdx = currentPageCursor ? parseInt(currentPageCursor) + limit : limit;
        const hasMore = nextIdx < res.data.total;
        set({
          payouts: res.data.items,
          total: res.data.total,
          nextCursor: hasMore ? nextIdx.toString() : null,
        });
      } else {
        set({ error: "Failed to fetch payouts" });
      }
    } catch (err: any) {
      set({ error: err?.message || "An error occurred fetching payouts" });
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
    await get().fetchPayouts();
  },

  goToPreviousPage: async () => {
    const { history } = get();
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevCursor = newHistory.pop() || null;
    set({
      history: newHistory,
      currentPageCursor: prevCursor,
    });
    await get().fetchPayouts();
  },

  updatePayoutStatus: async (id, status, notes) => {
    await financeService.updatePayoutStatus(id, { status, notes });
    await get().fetchPayouts();
  },
}));
