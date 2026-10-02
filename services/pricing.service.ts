import { apiClient } from "./api";

export interface PricingConfig {
  id?: string;
  baseDeliveryChargePaisa: number;
  baseDistanceKm: number;
  additionalChargePerKmPaisa: number;
  includedWeightKg: number;
  additionalChargePerKgPaisa: number;
  maxDeliverableWeightKg: number;
  platformFeePaisa: number;
  defaultPlatformMarkupPct: number;
  defaultCommissionPct: number;
  defaultItemWeightGrams: number;
  gstPercentage: number;
  gstRateBps: number;
  defaultSlotCutoffTime?: string | null;
  minGapBetweenSlotsMinutes?: number | null;
  maxSlotTimeChangesPerMonth?: number | null;
  slotTimeChangePenaltyPaisa?: number | null;
  version?: number;
}

export interface GetPricingConfigResponse {
  ok: boolean;
  data: PricingConfig;
}

export interface UpdatePricingConfigResponse {
  ok: boolean;
  data: PricingConfig;
}

export interface PricingRule {
  id?: string;
  name: string;
  type: string; // 'SURCHARGE' | 'DISCOUNT'
  priority: number;
  target: string; // 'PLATFORM_MARKUP' | 'SETTLEMENT_COMMISSION' | 'PLATFORM_FEE' | 'DELIVERY_FEE'
  conditions: Record<string, any>;
  actions: Record<string, any>;
  isActive: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetPricingRulesResponse {
  ok: boolean;
  data: {
    items: PricingRule[];
    nextCursor?: string | null;
  };
}

export interface PricingRuleResponse {
  ok: boolean;
  data: PricingRule;
}

export const pricingService = {
  getConfig: async (): Promise<GetPricingConfigResponse> => {
    const { data } = await apiClient.get<GetPricingConfigResponse>(
      "/admin/v1/pricing-config"
    );
    return data;
  },

  updateConfig: async (
    payload: Partial<PricingConfig>
  ): Promise<UpdatePricingConfigResponse> => {
    const { data } = await apiClient.put<UpdatePricingConfigResponse>(
      "/admin/v1/pricing-config",
      payload
    );
    return data;
  },

  getRules: async (params?: {
    isActive?: boolean;
    target?: string;
    limit?: number;
    cursor?: string;
  }): Promise<GetPricingRulesResponse> => {
    const { data } = await apiClient.get<GetPricingRulesResponse>(
      "/admin/v1/pricing-rules",
      { params }
    );
    return data;
  },

  getRule: async (id: string): Promise<PricingRuleResponse> => {
    const { data } = await apiClient.get<PricingRuleResponse>(
      `/admin/v1/pricing-rules/${id}`
    );
    return data;
  },

  createRule: async (
    payload: Omit<PricingRule, "id" | "createdAt" | "updatedAt">
  ): Promise<PricingRuleResponse> => {
    const { data } = await apiClient.post<PricingRuleResponse>(
      "/admin/v1/pricing-rules",
      payload
    );
    return data;
  },

  updateRule: async (
    id: string,
    payload: Partial<Omit<PricingRule, "id" | "createdAt" | "updatedAt">>
  ): Promise<PricingRuleResponse> => {
    const { data } = await apiClient.patch<PricingRuleResponse>(
      `/admin/v1/pricing-rules/${id}`,
      payload
    );
    return data;
  },

  deleteRule: async (id: string): Promise<{ ok: boolean; data: { success: boolean } }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: { success: boolean } }>(
      `/admin/v1/pricing-rules/${id}`
    );
    return data;
  },
};
