import { apiClient } from "./api";

// ── Response Types ─────────────────────────────────────────────────────────────

export interface PromotionConditions {
  minOrderValue?: number | null; // in paisa
  productIds?: string[] | null;
  categoryIds?: string[] | null;
  isFirstOrder?: boolean | null;
  chefIds?: string[] | null;
  targetCities?: string[] | null;
  targetCategories?: string[] | null;
  targetChefs?: string[] | null;
  targetSegments?: string[] | null;
}

export interface PromotionActions {
  type: "WAIVE_DELIVERY_FEE" | "BOGO" | "PERCENTAGE_CATEGORY" | "FLAT_SUBTOTAL" | "PERCENTAGE_SUBTOTAL";
  value?: number | null; // for percentage value, e.g. 20 for 20%
  valuePaisa?: number | null; // for flat subtotal discount value, e.g. 5000 for ₹50
  maxDiscountPaisa?: number | null; // max discount cap for percentage discount, e.g. 10000 for ₹100
  buyQuantity?: number | null; // for BOGO
  freeQuantity?: number | null; // for BOGO
  targetProductIds?: string[] | null; // for BOGO target items
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string | null;
  terms: string | null;
  code: string | null;
  displayType: "COUPON" | "LIST" | "BANNER" | "BANNER_AND_COUPON" | "HIDDEN";
  promotionType: "FREE_DELIVERY" | "BOGO" | "DISCOUNT" | "PLATFORM";
  priority: number;
  conditions: PromotionConditions;
  actions: PromotionActions;
  isActive: boolean;
  isStackable: boolean;
  validFrom: string; // ISO DateTime
  validUntil: string; // ISO DateTime
  budgetCapPaisa: number | null;
  budgetUsedPaisa: number;
  maxRedemptions: number | null;
  redemptionsCount: number;
  maxPerUser: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPromotionsResponse {
  ok: boolean;
  data: {
    items: Promotion[];
    nextCursor: string | null;
  };
}

export interface CreatePromotionPayload {
  title: string;
  subtitle?: string | null;
  terms?: string | null;
  code?: string | null;
  displayType?: "COUPON" | "LIST" | "BANNER" | "BANNER_AND_COUPON" | "HIDDEN";
  promotionType: "FREE_DELIVERY" | "BOGO" | "DISCOUNT" | "PLATFORM";
  priority?: number;
  conditions?: PromotionConditions;
  actions: PromotionActions;
  isActive?: boolean;
  isStackable?: boolean;
  validFrom: string;
  validUntil: string;
  budgetCapPaisa?: number | null;
  maxRedemptions?: number | null;
  maxPerUser?: number | null;
}

export interface UpdatePromotionPayload extends Partial<CreatePromotionPayload> {
  isActive?: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const promotionService = {
  // Get paginated list of promotions
  getPromotions: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    promotionType?: string;
    displayType?: string;
    isActive?: boolean;
  }): Promise<GetPromotionsResponse> => {
    const { data } = await apiClient.get<GetPromotionsResponse>(
      "/admin/v1/promotions",
      { params }
    );
    return data;
  },

  // Fetch a single promotion by ID
  getPromotion: async (id: string): Promise<{ ok: boolean; data: Promotion }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Promotion }>(
      `/admin/v1/promotions/${id}`
    );
    return data;
  },

  // Create a new promotion
  createPromotion: async (payload: CreatePromotionPayload): Promise<{ ok: boolean; data: Promotion }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: Promotion }>(
      "/admin/v1/promotions",
      payload
    );
    return data;
  },

  // Update an existing promotion
  updatePromotion: async (
    id: string,
    payload: UpdatePromotionPayload
  ): Promise<{ ok: boolean; data: Promotion }> => {
    const { data } = await apiClient.patch<{ ok: boolean; data: Promotion }>(
      `/admin/v1/promotions/${id}`,
      payload
    );
    return data;
  },

  // Delete a promotion
  deletePromotion: async (id: string): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.delete<{ ok: boolean }>(
      `/admin/v1/promotions/${id}`
    );
    return data;
  },
};
