import { create } from "zustand";
import { walletService, WalletTransaction, WalletStats } from "@/services/wallet.service";

interface WalletState {
  transactions: WalletTransaction[];
  stats: WalletStats | null;
  total: number;
  isLoading: boolean;
  isStatsLoading: boolean;
  error: string | null;
  
  // Pagination & Filters
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  search: string;
  type: string;
  status: string;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: { search?: string; type?: string; status?: string }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchStats: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  adjustBalance: (userId: string, payload: { amount: number; reason: string; type: "credit" | "debit" }) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  transactions: [],
  stats: null,
  total: 0,
  isLoading: false,
  isStatsLoading: false,
  error: null,

  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],
  search: "",
  type: "all",
  status: "all",

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchTransactions();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchTransactions();
  },

  resetFilters: async () => {
    set({
      search: "",
      type: "all",
      status: "all",
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchTransactions();
  },

  fetchStats: async () => {
    set({ isStatsLoading: true });
    try {
      const res = await walletService.getStats();
      if (res.ok) {
        set({ stats: res.data });
      }
    } catch (err: any) {
      console.error("Failed to load wallet stats", err);
    } finally {
      set({ isStatsLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, type, status } = get();

      const res = await walletService.getTransactions({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        type: type !== "all" ? type : undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res.ok) {
        const nextIdx = currentPageCursor ? parseInt(currentPageCursor) + limit : limit;
        const hasMore = nextIdx < res.data.total;
        set({
          transactions: res.data.items,
          total: res.data.total,
          nextCursor: hasMore ? nextIdx.toString() : null,
        });
      } else {
        set({ error: "Failed to fetch wallet transactions" });
      }
    } catch (err: any) {
      set({ error: err?.message || "An error occurred fetching transactions" });
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
    await get().fetchTransactions();
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
    await get().fetchTransactions();
  },

  adjustBalance: async (userId, payload) => {
    await walletService.adjustBalance(userId, payload);
    await get().fetchTransactions();
    await get().fetchStats();
  },
}));
