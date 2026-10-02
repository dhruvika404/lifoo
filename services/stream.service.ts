import { apiClient } from "./api";

export interface ActiveStreamItem {
  id: string;
  slotId: string;
  chefId: string;
  provider: string;
  livekitRoomName: string;
  state: "active" | "inactive" | string;
  scheduledStartAt: string;
  startedAt: string;
  endedAt: string | null;
  deletionScheduledAt: string | null;
  recordingB2Path: string | null;
  reconnectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetActiveStreamsResponse {
  ok: boolean;
  data: {
    items: ActiveStreamItem[];
    nextCursor: string | null;
  };
}

export const streamService = {
  // Fetch active stream sessions
  getActiveStreams: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<GetActiveStreamsResponse> => {
    const { data } = await apiClient.get<GetActiveStreamsResponse>(
      "/streams/sessions/active",
      { params }
    );
    return data;
  },

  // Terminate/stop a stream session
  stopStream: async (
    streamId: string,
    payload: { reason: string; notes?: string }
  ): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.post<{ ok: boolean }>(
      `/streams/sessions/${streamId}/stop`,
      payload
    );
    return data;
  },

  // Suspend a stream session
  suspendStream: async (streamId: string): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.post<{ ok: boolean }>(
      `/streams/sessions/${streamId}/suspend`
    );
    return data;
  },

  // Get admin token for a room
  getAdminToken: async (payload: {
    roomId: string;
    identity: string;
  }): Promise<{
    ok: boolean;
    data: { token: string; serverUrl?: string; livekit_url?: string; livekitUrl?: string };
  }> => {
    const { data } = await apiClient.post<{
      ok: boolean;
      data: { token: string; serverUrl?: string; livekit_url?: string; livekitUrl?: string };
    }>("/streams/admin-token", payload);
    return data;
  },

  // Fetch recorded stream playbacks
  getPlaybacks: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: any }>(
      "/streams/sessions/playbacks",
      { params }
    );
    return data;
  },

  // Get playback info for a recorded stream session
  getPlayback: async (
    streamId: string
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: any }>(
      `/streams/sessions/${streamId}/playback`
    );
    return data;
  },

  // Flag a dispute on a recorded stream session
  flagDispute: async (
    sessionId: string,
    payload: { reason: string }
  ): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.post<{ ok: boolean }>(
      `/streams/sessions/${sessionId}/flag-dispute`,
      payload
    );
    return data;
  },

  // Resolve a dispute on a recorded stream session
  resolveDispute: async (
    sessionId: string
  ): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.post<{ ok: boolean }>(
      `/streams/sessions/${sessionId}/resolve-dispute`,
      {}
    );
    return data;
  },
};
