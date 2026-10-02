import { create } from "zustand";
import { chefService, Chef, InviteChefPayload, UpdateChefPayload } from "@/services";

interface ChefState {
  chefs: Chef[];
  isLoading: boolean;
  error: string | null;

  fetchChefs: (filters?: {
    search?: string;
    status?: string;
    kycStatus?: string;
  }) => Promise<void>;
  inviteChef: (
    chefData: InviteChefPayload
  ) => Promise<void>;
  updateChef: (
    id: string,
    updatedData: UpdateChefPayload
  ) => Promise<void>;
  deleteChef: (id: string) => Promise<void>;
  suspendChef: (id: string) => Promise<void>;
  activateChef: (id: string) => Promise<void>;
}

export const useChefStore = create<ChefState>((set, get) => ({
  chefs: [],
  isLoading: false,
  error: null,

  fetchChefs: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const searchParam = filters?.search || undefined;
      const statusParam = filters?.status && filters.status !== "all" ? filters.status : undefined;
      const kycStatusParam = filters?.kycStatus && filters.kycStatus !== "all" ? filters.kycStatus : undefined;

      const response = await chefService.getChefs({
        search: searchParam,
        status: statusParam,
        kycStatus: kycStatusParam,
      });

      if (response && response.ok) {
        let items: Chef[] = [];
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data && typeof response.data === "object" && "items" in response.data) {
          items = response.data.items || [];
        }
        set({ chefs: items, error: null });
      } else {
        set({ error: "Failed to load chefs from API" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; // Handled globally by the API interceptor
      }
      console.error("[useChefStore] fetchChefs error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch chefs";
      set({ error: errMsg });
    } finally {
      set({ isLoading: false });
    }
  },

  inviteChef: async (chefData) => {
    set({ isLoading: true, error: null });
    try {
      await chefService.inviteChef(chefData);
      // Re-fetch to get latest state from backend
      await get().fetchChefs();
    } catch (err: any) {
      console.error("[useChefStore] inviteChef error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to invite chef";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateChef: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      await chefService.updateChef(id, updatedData);
      // Re-fetch to get latest state from backend
      await get().fetchChefs();
    } catch (err: any) {
      console.error("[useChefStore] updateChef error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update chef";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteChef: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await chefService.deleteChef(id);
      // Re-fetch to get latest state from backend
      await get().fetchChefs();
    } catch (err: any) {
      console.error("[useChefStore] deleteChef error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to delete chef";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  suspendChef: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await chefService.suspendChef(id);
      await get().fetchChefs();
    } catch (err: any) {
      console.error("[useChefStore] suspendChef error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to suspend chef";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  activateChef: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await chefService.activateChef(id);
      await get().fetchChefs();
    } catch (err: any) {
      console.error("[useChefStore] activateChef error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to activate chef";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
