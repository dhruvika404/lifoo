import { apiClient } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actorType: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ip: string;
  userAgent: string;
  requestId: string;
  targetUserId: string | null;
  message: string | null;
  occurredAt: string;
  actorName: string | null;
  actorEmail: string | null;
  targetUserName: string | null;
  beforeJsonb: Record<string, any> | null;
  afterJsonb: Record<string, any> | null;
}

export interface GetAuditLogsResponse {
  ok: boolean;
  data: {
    items: AuditLog[];
    nextCursor: string | null;
  };
}

export interface GetAuditLogsParams {
  limit?: number;
  cursor?: string;
  search?: string;
  actorType?: string;
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  targetUserId?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const auditLogService = {
  getAuditLogs: async (
    params?: GetAuditLogsParams
  ): Promise<GetAuditLogsResponse> => {
    // Strip empty/undefined values
    const cleanParams: Record<string, any> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== null) {
          cleanParams[key] = value;
        }
      }
    }
    const { data } = await apiClient.get<GetAuditLogsResponse>(
      "/admin/v1/audit-logs",
      { params: cleanParams }
    );
    return data;
  },

  getChefAuditLogs: async (
    chefId: string,
    params?: GetAuditLogsParams
  ): Promise<GetAuditLogsResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== null) {
          cleanParams[key] = value;
        }
      }
    }
    const { data } = await apiClient.get<GetAuditLogsResponse>(
      `/admin/v1/chefs/${chefId}/audit-logs`,
      { params: cleanParams }
    );
    return data;
  },
};
