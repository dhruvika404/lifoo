import { apiClient } from "./api";

export interface DietaryType {
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

export interface GetDietaryTypesResponse {
  ok: boolean;
  data: DietaryType[] | { items: DietaryType[]; nextCursor?: string | null };
}

export interface GetDietaryTypeUploadUrlResponse {
  data: {
    dietaryTypeId: string;
    presignedUrl: string;
    s3Key: string;
  };
}

export interface CreateDietaryTypePayload {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface CreateDietaryTypeResponse {
  ok: boolean;
  data: DietaryType;
}

export interface UpdateDietaryTypePayload {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export const dietaryTypeService = {
  getDietaryTypes: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
  }): Promise<GetDietaryTypesResponse> => {
    const { data } = await apiClient.get<GetDietaryTypesResponse>(
      "/admin/v1/dietary-types",
      { params }
    );
    return data;
  },

  getDietaryType: async (dietaryTypeId: string): Promise<{ ok: boolean; data: DietaryType }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: DietaryType }>(
      `/admin/v1/dietary-types/${dietaryTypeId}`
    );
    return data;
  },

  getUploadUrl: async (mimeType: string, dietaryTypeId?: string): Promise<GetDietaryTypeUploadUrlResponse> => {
    let url = `/admin/v1/dietary-types/upload-url?mimeType=${encodeURIComponent(mimeType)}`;
    if (dietaryTypeId) {
      url += `&dietaryTypeId=${encodeURIComponent(dietaryTypeId)}`;
    }
    const { data } = await apiClient.get<GetDietaryTypeUploadUrlResponse>(url);
    return data;
  },

  createDietaryType: async (
    payload: CreateDietaryTypePayload
  ): Promise<CreateDietaryTypeResponse> => {
    const { data } = await apiClient.post<CreateDietaryTypeResponse>(
      "/admin/v1/dietary-types",
      payload
    );
    return data;
  },

  updateDietaryType: async (
    dietaryTypeId: string,
    payload: UpdateDietaryTypePayload
  ): Promise<{ ok: boolean; data: DietaryType }> => {
    const { data } = await apiClient.patch<{ ok: boolean; data: DietaryType }>(
      `/admin/v1/dietary-types/${dietaryTypeId}`,
      payload
    );
    return data;
  },

  deleteDietaryType: async (
    dietaryTypeId: string
  ): Promise<{ ok: boolean; data: DietaryType }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: DietaryType }>(
      `/admin/v1/dietary-types/${dietaryTypeId}`
    );
    return data;
  },

};
