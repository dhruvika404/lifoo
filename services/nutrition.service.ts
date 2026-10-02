import { apiClient } from "./api";

export interface Nutrition {
  id: string;
  name: string;
  slug: string;
  defaultUnit: string;
  icon: string | null;
  status: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetNutritionsResponse {
  ok: boolean;
  data: {
    items: Nutrition[];
    nextCursor: string | null;
  };
}

export interface CreateNutritionResponse {
  ok: boolean;
  data: Nutrition;
}

export const nutritionService = {
  getNutritions: async (params?: {
    search?: string;
    status?: string;
    isActive?: boolean;
    limit?: number;
    cursor?: string;
  }): Promise<GetNutritionsResponse> => {
    const { data } = await apiClient.get<GetNutritionsResponse>("/admin/v1/nutritions", { params });
    return data;
  },

  createNutrition: async (payload: { name: string; defaultUnit: string; displayOrder?: number; icon?: string }): Promise<CreateNutritionResponse> => {
    const { data } = await apiClient.post<CreateNutritionResponse>("/admin/v1/nutritions", payload);
    return data;
  },

  getNutritionById: async (id: string): Promise<{ ok: boolean; data: Nutrition }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Nutrition }>(`/admin/v1/nutritions/${id}`);
    return data;
  },

  updateNutrition: async (id: string, payload: Partial<Nutrition>): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/nutritions/${id}`, payload);
    return data;
  },

  deleteNutrition: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete(`/admin/v1/nutritions/${id}`);
    return data;
  },

  getUploadUrl: async (mimeType: string, nutritionId: string): Promise<any> => {
    const { data } = await apiClient.get(`/admin/v1/nutritions/upload-url`, {
      params: { mimeType, nutritionId }
    });
    return data;
  }
};
