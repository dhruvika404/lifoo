import { create } from "zustand";
import { streamService } from "@/services";
import type { ActiveStreamItem } from "@/services/stream.service";

interface StreamState {
  rawStreams: ActiveStreamItem[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];

  setLimit: (limit: number) => Promise<void>;
  fetchStreams: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  suspendStream: (id: string) => Promise<void>;
}

export const useStreamStore = create<StreamState>((set, get) => ({
  rawStreams: [],
  isLoading: false,
  error: null,
  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchStreams();
  },

  fetchStreams: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor } = get();
      const res = await streamService.getActiveStreams({
        limit,
        cursor: currentPageCursor ?? undefined,
      });

      if (res && res.ok) {
        const items = res.data?.items || [];
        const nextCursor = res.data?.nextCursor || null;
        set({ rawStreams: items, nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch streams" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return; // Ignore 401 errors as they are handled globally
      }
      console.error("[useStreamStore] fetchStreams error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch streams";
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
    await get().fetchStreams();
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
    await get().fetchStreams();
  },

  suspendStream: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await streamService.suspendStream(id);
      if (res.ok) {
        await get().fetchStreams();
      } else {
        throw new Error("Failed to suspend stream");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      console.error("[useStreamStore] suspendStream error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to suspend stream";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
