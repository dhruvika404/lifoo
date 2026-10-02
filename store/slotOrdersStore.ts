import { create } from "zustand";
import { slotService, SlotOrder, SlotOrdersSummary } from "@/services/slot.service";

interface SlotOrdersState {
  orders: SlotOrder[];
  slotSummary: SlotOrdersSummary | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  /** Stored so page/limit changes can refetch without the caller passing slotId again */
  currentSlotId: string | null;

  fetchOrders: (slotId: string, page?: number, limit?: number) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  reset: () => void;
}

export const useSlotOrdersStore = create<SlotOrdersState>((set, get) => ({
  orders: [],
  slotSummary: null,
  total: 0,
  isLoading: false,
  error: null,
  page: 1,
  limit: 10,
  currentSlotId: null,

  fetchOrders: async (slotId: string, page = get().page, limit = get().limit) => {
    set({ isLoading: true, error: null, currentSlotId: slotId });
    try {
      const response = await slotService.getSlotOrders(slotId, { page, limit });
      set({
        slotSummary: response.data.slot ?? null,
        orders: response.data.items,
        total: response.data.total,
        page,
        limit,
      });
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch slot orders",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setPage: async (page: number) => {
    const { currentSlotId, limit, fetchOrders } = get();
    if (!currentSlotId) return;
    set({ page });
    await fetchOrders(currentSlotId, page, limit);
  },

  setLimit: async (limit: number) => {
    const { currentSlotId, fetchOrders } = get();
    if (!currentSlotId) return;
    set({ limit, page: 1 });
    await fetchOrders(currentSlotId, 1, limit);
  },

  reset: () => {
    set({
      orders: [],
      slotSummary: null,
      total: 0,
      isLoading: false,
      error: null,
      page: 1,
      limit: 10,
      currentSlotId: null,
    });
  },
}));
