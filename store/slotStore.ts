import { create } from "zustand";
import { slotService } from "@/services/slot.service";
import type { Slot, GetSlotsParams, SlotReviewAction } from "@/services/slot.service";


interface SlotStoreState {
  slots: Slot[];
  selectedSlot: Slot | null;
  total: number;
  isLoading: boolean;
  isDetailLoading: boolean;
  isApprovalToggling: boolean;
  isReviewing: boolean;
  error: string | null;
  page: number;
  limit: number;
  search: string;
  state: string;
  chefId: string;
  productId: string;
  startDate: string;
  endDate: string;
  approvalRequired: boolean;

  // Actions
  fetchSlots: () => Promise<void>;
  fetchSlotById: (id: string) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  setFilters: (
    filters: Partial<
      Pick<
        SlotStoreState,
        "search" | "state" | "chefId" | "productId" | "startDate" | "endDate"
      >
    >
  ) => Promise<void>;
  resetFilters: () => Promise<void>;
  clearSelectedSlot: () => void;
  toggleApproval: (enabled: boolean) => Promise<void>;
  reviewSlot: (slotId: string, action: SlotReviewAction, reason?: string) => Promise<void>;
}


export const useSlotStore = create<SlotStoreState>((set, get) => ({
  slots: [],
  selectedSlot: null,
  total: 0,
  isLoading: false,
  isDetailLoading: false,
  isApprovalToggling: false,
  isReviewing: false,
  error: null,
  page: 1,
  limit: 10,
  search: "",
  state: "",
  chefId: "",
  productId: "",
  startDate: "",
  endDate: "",
  approvalRequired: false,

  fetchSlots: async () => {
    set({ isLoading: true, error: null });
    try {
      const { page, limit, search, state, chefId, productId, startDate, endDate } =
        get();

      const params: GetSlotsParams = {
        page,
        limit,
        q: search || undefined,
        state: state || undefined,
        chefId: chefId || undefined,
        productId: productId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await slotService.getSlots(params);
      if (res.ok) {
        set({ slots: res.data.items, total: res.data.total, error: null });
      } else {
        set({ error: "Failed to fetch slots" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[useSlotStore] fetchSlots error:", err);
      set({
        error:
          err?.response?.data?.message || err?.message || "Failed to fetch slots",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSlotById: async (id: string) => {
    set({ isDetailLoading: true, error: null });
    try {
      const res = await slotService.getSlotById(id);
      if (res.ok) {
        set({ selectedSlot: res.data });
      } else {
        set({ error: "Failed to fetch slot details" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[useSlotStore] fetchSlotById error:", err);
      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch slot details",
      });
    } finally {
      set({ isDetailLoading: false });
    }
  },

  toggleApproval: async (enabled: boolean) => {
    set({ isApprovalToggling: true });
    set({ approvalRequired: enabled });
    try {
      await slotService.toggleApproval({ requireSlotApproval: enabled });
    } catch (err: any) {
      set({ approvalRequired: !enabled });
      console.error("[useSlotStore] toggleApproval error:", err);
      throw err;
    } finally {
      set({ isApprovalToggling: false });
    }
  },

  reviewSlot: async (slotId: string, action: SlotReviewAction, reason?: string) => {
    set({ isReviewing: true });
    try {
      const payload = reason ? { action, reason } : { action };
      await slotService.reviewSlot(slotId, payload);
      await get().fetchSlots();
      const { selectedSlot } = get();
      if (selectedSlot && selectedSlot.id === slotId) {
        await get().fetchSlotById(slotId);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[useSlotStore] reviewSlot error:", err);
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  setPage: async (page: number) => {
    set({ page });
    await get().fetchSlots();
  },

  setLimit: async (limit: number) => {
    set({ limit, page: 1 });
    await get().fetchSlots();
  },

  setFilters: async (filters) => {
    set({ ...filters, page: 1 });
    await get().fetchSlots();
  },

  resetFilters: async () => {
    set({
      search: "",
      state: "",
      chefId: "",
      productId: "",
      startDate: "",
      endDate: "",
      page: 1,
    });
    await get().fetchSlots();
  },

  clearSelectedSlot: () => set({ selectedSlot: null }),
}));