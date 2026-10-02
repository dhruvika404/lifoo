import { apiClient } from "./api";

export interface Cuisine {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCuisinesResponse {
  ok: boolean;
  data: Cuisine[] | { items: Cuisine[]; nextCursor?: string | null };
}

export interface GetCuisineUploadUrlResponse {
  data: {
    cuisineId: string;
    presignedUrl: string;
    s3Key: string;
  };
}

export interface CreateCuisinePayload {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface CreateCuisineResponse {
  ok: boolean;
  data: Cuisine;
}

export interface UpdateCuisinePayload {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export const cuisineService = {
  getCuisines: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
  }): Promise<GetCuisinesResponse> => {
    const { data } = await apiClient.get<GetCuisinesResponse>(
      "/admin/v1/cuisines",
      { params }
    );
    return data;
  },

  getCuisine: async (cuisineId: string): Promise<{ ok: boolean; data: Cuisine }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Cuisine }>(
      `/admin/v1/cuisines/${cuisineId}`
    );
    return data;
  },

  getUploadUrl: async (mimeType: string): Promise<GetCuisineUploadUrlResponse> => {
    const { data } = await apiClient.get<GetCuisineUploadUrlResponse>(
      `/admin/v1/cuisines/upload-url?mimeType=${encodeURIComponent(mimeType)}`
    );
    return data;
  },

  createCuisine: async (
    payload: CreateCuisinePayload
  ): Promise<CreateCuisineResponse> => {
    const { data } = await apiClient.post<CreateCuisineResponse>(
      "/admin/v1/cuisines",
      payload
    );
    return data;
  },

  updateCuisine: async (
    cuisineId: string,
    payload: UpdateCuisinePayload
  ): Promise<{ ok: boolean; data: Cuisine }> => {
    const { data } = await apiClient.patch<{ ok: boolean; data: Cuisine }>(
      `/admin/v1/cuisines/${cuisineId}`,
      payload
    );
    return data;
  },

  deleteCuisine: async (
    cuisineId: string
  ): Promise<{ ok: boolean; data: Cuisine }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: Cuisine }>(
      `/admin/v1/cuisines/${cuisineId}`
    );
    return data;
  },

};
