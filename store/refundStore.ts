import { create } from "zustand";
import { refundService, RefundRequest } from "@/services/refund.service";

interface RefundState {
  refunds: RefundRequest[];
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
  fetchRefunds: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  updateRefundStatus: (id: string, status: "approved" | "rejected" | "processed", notes?: string) => Promise<void>;
}

export const useRefundStore = create<RefundState>((set, get) => ({
  refunds: [],
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
    await get().fetchRefunds();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchRefunds();
  },

  resetFilters: async () => {
    set({
      search: "",
      status: "all",
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchRefunds();
  },

  fetchRefunds: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, status } = get();

      const res = await refundService.getRefunds({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res.ok) {
        const nextIdx = currentPageCursor ? parseInt(currentPageCursor) + limit : limit;
        const hasMore = nextIdx < res.data.total;
        set({
          refunds: res.data.items,
          total: res.data.total,
          nextCursor: hasMore ? nextIdx.toString() : null,
        });
      } else {
        set({ error: "Failed to fetch refunds" });
      }
    } catch (err: any) {
      set({ error: err?.message || "An error occurred fetching refunds" });
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
    await get().fetchRefunds();
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
    await get().fetchRefunds();
  },

  updateRefundStatus: async (id, status, notes) => {
    await refundService.updateRefundStatus(id, { status, notes });
    await get().fetchRefunds();
  },
}));
