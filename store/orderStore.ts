import { create } from "zustand";
import { orderService } from "@/services/order.service";
import type { Order } from "@/services/order.service";

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  search: string;
  status: string;
  slotId?: string;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: { search?: string; status?: string; slotId?: string }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  updateOrderStatus: (
    id: string,
    status: Order["status"]
  ) => Promise<void>;
  getOrder: (id: string) => Promise<Order>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],
  search: "",
  status: "all",
  slotId: undefined,

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchOrders();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchOrders();
  },

  resetFilters: async () => {
    set({
      search: "",
      status: "all",
      slotId: undefined,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchOrders();
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, status, slotId } = get();

      const res = await orderService.getOrders({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        slotId,
      });

      if (res.ok) {
        set({
          orders: res.data.items,
          nextCursor: res.data.nextCursor || null,
          error: null,
        });
      } else {
        set({ error: "Failed to fetch orders" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return;
      }
      console.error("[useOrderStore] fetchOrders error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to fetch orders";
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
    await get().fetchOrders();
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
    await get().fetchOrders();
  },

  updateOrderStatus: async (id: string, status: Order["status"]) => {
    set({ isLoading: true, error: null });
    try {
      const res = await orderService.updateOrderStatus(id, status);
      if (res.ok) {
        await get().fetchOrders();
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useOrderStore] updateOrderStatus error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to update order status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getOrder: async (id: string) => {
    try {
      const res = await orderService.getOrder(id);
      if (res.ok) {
        return res.data;
      }
      throw new Error("Failed to fetch order");
    } catch (err: any) {
      console.error("[useOrderStore] getOrder error:", err);
      throw err;
    }
  },
}));
