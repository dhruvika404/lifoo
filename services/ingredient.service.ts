import { apiClient } from "./api";

export interface Ingredient {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  status: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetIngredientsResponse {
  ok: boolean;
  data: {
    items: Ingredient[];
    nextCursor: string | null;
  };
}

export interface CreateIngredientResponse {
  ok: boolean;
  data: Ingredient;
}

export const ingredientService = {
  getIngredients: async (params?: {
    search?: string;
    limit?: number;
    cursor?: string;
    createdAt?: "asc" | "desc";
  }): Promise<GetIngredientsResponse> => {
    const { data } = await apiClient.get<GetIngredientsResponse>("/admin/v1/ingredients", { params });
    return data;
  },

  createIngredient: async (payload: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CreateIngredientResponse> => {
    const { data } = await apiClient.post<CreateIngredientResponse>("/admin/v1/ingredients", payload);
    return data;
  },

  getIngredientById: async (id: string): Promise<{ ok: boolean; data: Ingredient }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Ingredient }>(`/admin/v1/ingredients/${id}`);
    return data;
  },

  updateIngredient: async (id: string, payload: Partial<Ingredient>): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/ingredients/${id}`, payload);
    return data;
  },

  deleteIngredient: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete(`/admin/v1/ingredients/${id}`);
    return data;
  },

  getUploadUrl: async (mimeType: string, ingredientId?: string): Promise<any> => {
    const { data } = await apiClient.get(`/admin/v1/ingredients/upload-url`, {
      params: { mimeType, ingredientId }
    });
    return data;
  }
};
