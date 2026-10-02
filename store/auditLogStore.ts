import { create } from "zustand";
import { auditLogService } from "@/services/auditLog.service";
import type { AuditLog, GetAuditLogsParams } from "@/services/auditLog.service";

interface AuditLogState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  // Pagination
  limit: number;
  currentPageCursor: string | null;
  nextCursor: string | null;
  history: (string | null)[];

  // Filters
  search: string;
  actorType: string;
  action: string;
  resourceType: string;

  // Actions
  fetchLogs: () => Promise<void>;
  setFilters: (filters: Partial<Pick<AuditLogState, "search" | "actorType" | "action" | "resourceType">>) => Promise<void>;
  resetFilters: () => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
}

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  limit: 10,
  currentPageCursor: null,
  nextCursor: null,
  history: [],

  search: "",
  actorType: "",
  action: "",
  resourceType: "",

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { limit, currentPageCursor, search, actorType, action, resourceType } = get();

      const params: GetAuditLogsParams = {
        limit,
        cursor: currentPageCursor ?? undefined,
        search: search || undefined,
        actorType: actorType || undefined,
        action: action || undefined,
        resourceType: resourceType || undefined,
      };

      const res = await auditLogService.getAuditLogs(params);
      if (res.ok) {
        set({ logs: res.data.items, nextCursor: res.data.nextCursor, error: null });
      } else {
        set({ error: "Failed to fetch audit logs" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[useAuditLogStore] fetchLogs error:", err);
      set({ error: err?.response?.data?.message || err?.message || "Failed to fetch audit logs" });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: async (filters) => {
    set({ ...filters, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchLogs();
  },

  resetFilters: async () => {
    set({
      search: "",
      actorType: "",
      action: "",
      resourceType: "",
      currentPageCursor: null,
      history: [],
      nextCursor: null,
    });
    await get().fetchLogs();
  },

  setLimit: async (limit: number) => {
    set({ limit, currentPageCursor: null, history: [], nextCursor: null });
    await get().fetchLogs();
  },

  goToNextPage: async () => {
    const { nextCursor, currentPageCursor, history } = get();
    if (!nextCursor) return;
    set({ history: [...history, currentPageCursor], currentPageCursor: nextCursor });
    await get().fetchLogs();
  },

  goToPreviousPage: async () => {
    const { history } = get();
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevCursor = newHistory.pop()!;
    set({ history: newHistory, currentPageCursor: prevCursor });
    await get().fetchLogs();
  },
}));
