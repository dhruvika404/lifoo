import { apiClient } from "./api";

export interface FoodGoal {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetFoodGoalsResponse {
  ok: boolean;
  data: FoodGoal[] | { items: FoodGoal[]; nextCursor?: string | null };
}

export interface GetFoodGoalUploadUrlResponse {
  data: {
    id?: string;
    foodGoalId?: string;
    presignedUrl: string;
    s3Key: string;
  };
}

export interface CreateFoodGoalPayload {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateFoodGoalPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export const foodGoalService = {
  getFoodGoals: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    active?: boolean;
    sortOrder?: string;
    createdAt?: string;
  }): Promise<GetFoodGoalsResponse> => {
    const { data } = await apiClient.get<GetFoodGoalsResponse>(
      "/admin/v1/food-goals",
      { params }
    );
    return data;
  },

  getFoodGoal: async (id: string): Promise<{ ok: boolean; data: FoodGoal }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: FoodGoal }>(
      `/admin/v1/food-goals/${id}`
    );
    return data;
  },

  getUploadUrl: async (mimeType: string, foodGoalId?: string): Promise<GetFoodGoalUploadUrlResponse> => {
    let url = `/admin/v1/food-goals/upload-url?mimeType=${encodeURIComponent(mimeType)}`;
    if (foodGoalId) {
      url += `&foodGoalId=${encodeURIComponent(foodGoalId)}`;
    }
    const { data } = await apiClient.get<GetFoodGoalUploadUrlResponse>(url);
    return data;
  },

  createFoodGoal: async (
    payload: CreateFoodGoalPayload
  ): Promise<{ ok: boolean; data: FoodGoal }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: FoodGoal }>(
      "/admin/v1/food-goals",
      payload
    );
    return data;
  },

  updateFoodGoal: async (
    id: string,
    payload: UpdateFoodGoalPayload
  ): Promise<{ ok: boolean; data: FoodGoal }> => {
    const { data } = await apiClient.patch<{ ok: boolean; data: FoodGoal }>(
      `/admin/v1/food-goals/${id}`,
      payload
    );
    return data;
  },

  deleteFoodGoal: async (
    id: string
  ): Promise<{ ok: boolean; data: FoodGoal }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: FoodGoal }>(
      `/admin/v1/food-goals/${id}`
    );
    return data;
  },
};
