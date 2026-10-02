import { create } from "zustand";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/services/customer.service";

interface CustomerState {
  customers: Customer[];
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
  fetchCustomers: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  updateCustomerStatus: (
    id: string,
    status: "active" | "suspended" | "blocked"
  ) => Promise<void>;
  getCustomer: (id: string) => Promise<Customer>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
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
    await get().fetchCustomers();
  },

  setFilters: async (filters) => {
    set({
      ...filters,
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchCustomers();
  },

  resetFilters: async () => {
    set({
      search: "",
      status: "all",
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchCustomers();
  },

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, status } = get();

      const res = await customerService.getCustomers({
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res.ok) {
        set({
          customers: res.data.items,
          nextCursor: res.data.nextCursor || null,
          error: null,
        });
      } else {
        set({ error: "Failed to fetch customers" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return;
      }
      console.error("[useCustomerStore] fetchCustomers error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to fetch customers";
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
    await get().fetchCustomers();
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
    await get().fetchCustomers();
  },

  updateCustomerStatus: async (
    id: string,
    status: "active" | "suspended" | "blocked"
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await customerService.updateCustomerStatus(id, status);
      if (res.ok) {
        await get().fetchCustomers();
      } else {
        throw new Error("Failed to update customer status");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useCustomerStore] updateCustomerStatus error:", err);
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to update customer status";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getCustomer: async (id: string) => {
    try {
      const res = await customerService.getCustomer(id);
      if (res.ok) {
        return res.data;
      }
      throw new Error("Failed to fetch customer");
    } catch (err: any) {
      console.error("[useCustomerStore] getCustomer error:", err);
      throw err;
    }
  },
}));
