import { apiClient } from "./api";

export interface SlotChef {
  id: string;
  name: string;
}

export interface SlotProduct {
  id: string;
  name: string;
  slug: string;
  images?: { url: string }[];
}

export type SlotState =
  | "draft"
  | "published"
  | "cutoff_reached"
  | "cooking"
  | "ready_for_pickup"
  | "complete"
  | "cancelled";

export interface Slot {
  id: string;
  chefId: string;
  productId: string;
  variantId: string | null;
  addressId: string;
  capacity: number;
  capacityRemaining: number;
  startAt: string;
  cutoffAt: string;
  readyBy: string;
  lastCancellationAt: string | null;
  state: SlotState;
  notes: string | null;
  version: number;
  publishedAt: string | null;
  cookingStartedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  chef: SlotChef;
  product: SlotProduct;
}

export interface GetSlotsParams {
  page?: number;
  limit?: number;
  q?: string;
  chefId?: string;
  productId?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
}

export interface GetSlotsResponse {
  ok: boolean;
  data: {
    items: Slot[];
    total: number;
  };
}

export interface SlotOrderDeliveryAddress {
  recipient?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface SlotOrderCustomer {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface SlotOrder {
  id: string;              // order item ID
  orderId: string;         // parent order ID
  productId?: string;
  productName?: string;
  variantId?: string | null;
  quantity?: number;
  unitPricePaisa?: number;
  lineTotalPaisa?: number;
  state?: string;          // item state
  orderState?: string;     // parent order state
  customer?: SlotOrderCustomer;
  deliveryAddress?: SlotOrderDeliveryAddress;
  notes?: string | null;
  tamperSeal?: string | null;
  delivery?: unknown;
  createdAt?: string;
  [key: string]: any;
}

export interface SlotOrdersSummary {
  id: string;
  productId: string;
  productName: string;
  capacity: number;
  capacityRemaining: number;
  bookedQuantity: number;
  totalRevenuePaisa: number;
  startAt: string;
  cutoffAt: string;
  readyBy: string;
  state: SlotState;
}

export interface GetSlotOrdersResponse {
  ok: boolean;
  data: {
    slot: SlotOrdersSummary;
    items: SlotOrder[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetSlotByIdResponse {
  ok: boolean;
  data: Slot;
}

export type SlotReviewAction = "approve" | "reject";

export interface ToggleApprovalPayload {
  requireSlotApproval: boolean;
}

export interface ToggleApprovalResponse {
  ok: boolean;
  data?: {
    requireSlotApproval: boolean;
  };
}

export interface ReviewSlotPayload {
  action: SlotReviewAction;
  reason?: string;
}

export interface ReviewSlotResponse {
  ok: boolean;
  data?: unknown;
}


export const slotService = {
  getSlots: async (params?: GetSlotsParams): Promise<GetSlotsResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== null) {
          cleanParams[key] = value;
        }
      }
    }
    const { data } = await apiClient.get<GetSlotsResponse>("/admin/v1/slots", {
      params: cleanParams,
    });
    return data;
  },

  getSlotById: async (slotId: string): Promise<GetSlotByIdResponse> => {
    const { data } = await apiClient.get<GetSlotByIdResponse>(
      `/admin/v1/slots/${slotId}`
    );
    return data;
  },

  toggleApproval: async (
    payload: ToggleApprovalPayload
  ): Promise<ToggleApprovalResponse> => {
    const { data } = await apiClient.post<ToggleApprovalResponse>(
      "/admin/v1/slots/settings/approval-toggle",
      payload
    );
    return data;
  },


  reviewSlot: async (
    slotId: string,
    payload: ReviewSlotPayload
  ): Promise<ReviewSlotResponse> => {
    const { data } = await apiClient.post<ReviewSlotResponse>(
      `/admin/v1/slots/${slotId}/review`,
      payload
    );
    return data;
  },

  getSlotOrders: async (slotId: string, params?: { page?: number; limit?: number }): Promise<GetSlotOrdersResponse> => {
    const { data } = await apiClient.get<GetSlotOrdersResponse>(`/admin/v1/slots/${slotId}/orders`, {
      params,
    });
    return data;
  },
};