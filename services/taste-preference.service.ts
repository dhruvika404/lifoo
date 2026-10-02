import { apiClient } from "./api";

export interface TastePreference {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  iconUrl?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTastePreferencesResponse {
  ok: boolean;
  data: TastePreference[] | { items: TastePreference[]; nextCursor?: string | null };
}

export interface GetTastePreferenceUploadUrlResponse {
  data: {
    id?: string;
    tastePreferenceId?: string;
    presignedUrl: string;
    s3Key: string;
  };
}

export interface CreateTastePreferencePayload {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateTastePreferencePayload {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export const tastePreferenceService = {
  getTastePreferences: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    active?: boolean;
    createdAt?: string;
  }): Promise<GetTastePreferencesResponse> => {
    const { data } = await apiClient.get<GetTastePreferencesResponse>(
      "/admin/v1/taste-preferences",
      { params }
    );
    return data;
  },

  getTastePreference: async (id: string): Promise<{ ok: boolean; data: TastePreference }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: TastePreference }>(
      `/admin/v1/taste-preferences/${id}`
    );
    return data;
  },

  getUploadUrl: async (mimeType: string, tastePreferenceId?: string): Promise<GetTastePreferenceUploadUrlResponse> => {
    let url = `/admin/v1/taste-preferences/upload-url?mimeType=${encodeURIComponent(mimeType)}`;
    if (tastePreferenceId) {
      url += `&tastePreferenceId=${encodeURIComponent(tastePreferenceId)}`;
    }
    const { data } = await apiClient.get<GetTastePreferenceUploadUrlResponse>(url);
    return data;
  },

  createTastePreference: async (
    payload: CreateTastePreferencePayload
  ): Promise<{ ok: boolean; data: TastePreference }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: TastePreference }>(
      "/admin/v1/taste-preferences",
      payload
    );
    return data;
  },

  updateTastePreference: async (
    id: string,
    payload: UpdateTastePreferencePayload
  ): Promise<{ ok: boolean; data: TastePreference }> => {
    const { data } = await apiClient.patch<{ ok: boolean; data: TastePreference }>(
      `/admin/v1/taste-preferences/${id}`,
      payload
    );
    return data;
  },

  deleteTastePreference: async (
    id: string
  ): Promise<{ ok: boolean; data: TastePreference }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: TastePreference }>(
      `/admin/v1/taste-preferences/${id}`
    );
    return data;
  },
};
