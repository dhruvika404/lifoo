import { create } from "zustand";
import { deliveryService } from "@/services/delivery.service";
import type { Delivery } from "@/services/delivery.service";

interface DeliveryState {
  deliveries: Delivery[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];
  search: string;
  status: string;

  setLimit: (limit: number) => Promise<void>;
  setFilters: (filters: { search?: string; status?: string }) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchDeliveries: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  updateDeliveryStatus: (
    id: string,
    status: Delivery["status"]
  ) => Promise<void>;
  assignRider: (
    id: string,
    riderId: string
  ) => Promise<void>;
  getDelivery: (id: string) => Promise<Delivery>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
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
    await get().fetchDeliveries();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchDeliveries();
  },

  resetFilters: async () => {
    set({
      search: "",
      status: "all",
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchDeliveries();
  },

  fetchDeliveries: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, status } = get();

      const res = await deliveryService.getDeliveries({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res.ok) {
        set({
          deliveries: res.data.items,
          nextCursor: res.data.nextCursor || null,
          error: null,
        });
      } else {
        set({ error: "Failed to fetch deliveries" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return;
      }
      console.error("[useDeliveryStore] fetchDeliveries error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to fetch deliveries";
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
    await get().fetchDeliveries();
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
    await get().fetchDeliveries();
  },

  updateDeliveryStatus: async (id: string, status: Delivery["status"]) => {
    set({ isLoading: true, error: null });
    try {
      const res = await deliveryService.updateDeliveryStatus(id, status);
      if (res.ok) {
        await get().fetchDeliveries();
      } else {
        throw new Error("Failed to update delivery status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useDeliveryStore] updateDeliveryStatus error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to update delivery status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  assignRider: async (id: string, riderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await deliveryService.assignRider(id, riderId);
      if (res.ok) {
        await get().fetchDeliveries();
      } else {
        throw new Error("Failed to assign rider");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useDeliveryStore] assignRider error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to assign rider";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getDelivery: async (id: string) => {
    try {
      const res = await deliveryService.getDelivery(id);
      if (res.ok) {
        return res.data;
      }
      throw new Error("Failed to fetch delivery");
    } catch (err: any) {
      console.error("[useDeliveryStore] getDelivery error:", err);
      throw err;
    }
  },
}));
