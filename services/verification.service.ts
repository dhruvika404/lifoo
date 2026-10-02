import { apiClient } from "./api";

// ─── Common Types ─────────────────────────────────────────────────────────────
export type VerificationStatus = "pending" | "approved" | "rejected" | "resubmission";
export type ReviewAction = "approve" | "reject" | "resubmit";

export interface ReviewPayload {
  action: ReviewAction;
  reason?: string;
}

// ─── Profile / Address ────────────────────────────────────────────────────────
export interface ProfileAddress {
  id: string;
  type: string;
  recipient: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  approvalStatus: string; // "pending" | "approved" | "rejected"
  rejectionReason: string | null;
  createdAt: string;
}

export interface ProfileVerificationItem {
  chefId: string;
  displayName: string;
  businessName: string;
  phone: string;
  email: string | null;
  cityId: string | null;
  addresses: ProfileAddress[];
}

export interface GetProfilesResponse {
  ok: boolean;
  data: {
    items: ProfileVerificationItem[];
    nextCursor?: string | null;
    statusCounts?: Record<string, number>;
  };
}

// ─── Bank Account ─────────────────────────────────────────────────────────────
export interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  accountNumberLast4: string;
  ifsc: string;
  bankName: string;
  branch: string;
  isPrimary: boolean;
  approvalStatus: string; // "pending" | "approved" | "rejected"
  rejectionReason: string | null;
  createdAt: string;
}

export interface BankVerificationItem {
  chefId: string;
  displayName: string;
  businessName: string;
  phone: string;
  email: string | null;
  bankAccounts: BankAccount[];
}

export interface GetBankAccountsResponse {
  ok: boolean;
  data: {
    items: BankVerificationItem[];
    nextCursor?: string | null;
    statusCounts?: Record<string, number>;
  };
}

// ─── Document ─────────────────────────────────────────────────────────────────
export interface ChefDocument {
  id: string;
  chefId: string;
  docType: string; // "aadhaar" | "pan" | "fssai" | "bank_proof" | "kitchen_photo" | "profile_photo" | "kitchen_hygiene_video"
  digioDocId: string | null;
  s3Path: string;
  status: string; // "pending" | "approved" | "rejected"
  rejectionReason: string | null;
  verifiedAt: string | null;
  expiresAt: string | null;
  uploadedAt: string;
  reviewedByAdminId: string | null;
  reviewedAt: string | null;
}

export interface DocumentVerificationItem {
  chefId: string;
  displayName: string;
  businessName: string;
  phone: string;
  email: string | null;
  documents: ChefDocument[];
}

export interface GetDocumentsResponse {
  ok: boolean;
  data: {
    items: DocumentVerificationItem[];
    nextCursor?: string | null;
    statusCounts?: Record<string, number>;
  };
}

// ─── Product (Menu) ───────────────────────────────────────────────────────────
export interface ProductVerification {
  id: string;
  chefId: string;
  chefDisplayName: string;
  chefBusinessName: string;
  chefPhone: string;
  name: string;
  description: string | null;
  price: number;
  status: string; // "active" | "draft" | "pending" | "rejected"
  preparationTimeMinutes: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsResponse {
  ok: boolean;
  data: {
    items: ProductVerification[];
    nextCursor?: string | null;
    statusCounts?: Record<string, number>;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const verificationService = {
  // 1. Profile / address verifications
  getProfiles: async (params?: {
    search?: string;
    cityId?: string;
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<GetProfilesResponse> => {
    const { data } = await apiClient.get<GetProfilesResponse>(
      "/admin/v1/verifications/profiles",
      { params }
    );
    return data;
  },

  // 2. Review a profile address
  reviewProfileAddress: async (
    addressId: string,
    payload: ReviewPayload
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/verifications/profiles/addresses/${addressId}/review`,
      payload
    );
    return data;
  },

  // 3. Bank account verifications
  getBankAccounts: async (params?: {
    search?: string;
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<GetBankAccountsResponse> => {
    const { data } = await apiClient.get<GetBankAccountsResponse>(
      "/admin/v1/verifications/bank-accounts",
      { params }
    );
    return data;
  },

  // 4. Review a bank account
  reviewBankAccount: async (
    bankAccountId: string,
    payload: ReviewPayload
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/verifications/bank-accounts/${bankAccountId}/review`,
      payload
    );
    return data;
  },

  // 5. Document verifications
  getDocuments: async (params?: {
    search?: string;
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<GetDocumentsResponse> => {
    const { data } = await apiClient.get<GetDocumentsResponse>(
      "/admin/v1/verifications/documents",
      { params }
    );
    return data;
  },

  // 6. Review a document
  reviewDocument: async (
    documentId: string,
    payload: ReviewPayload
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/verifications/documents/${documentId}/review`,
      payload
    );
    return data;
  },

  // 7. Product (menu) verifications
  getProducts: async (params?: {
    search?: string;
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<GetProductsResponse> => {
    const { data } = await apiClient.get<GetProductsResponse>(
      "/admin/v1/verifications/products",
      { params }
    );
    return data;
  },

  // 8. Review a product
  reviewProduct: async (
    productId: string,
    payload: ReviewPayload
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/verifications/products/${productId}/review`,
      payload
    );
    return data;
  },

  // 9. Kitchen address verifications
  getKitchenAddresses: async (params?: {
    search?: string;
    page?: number;
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<GetKitchenAddressesResponse> => {
    const { data } = await apiClient.get<GetKitchenAddressesResponse>(
      "/admin/v1/verifications/kitchen-addresses",
      { params }
    );
    return data;
  },

  // 10. Review a kitchen address
  reviewKitchenAddress: async (
    kitchenAddressId: string,
    payload: ReviewPayload
  ): Promise<{ ok: boolean; data: any }> => {
    const actionMapped =
      payload.action === "approve"
        ? "approved"
        : payload.action === "reject"
        ? "rejected"
        : "resubmitted";
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/verifications/kitchen-addresses/${kitchenAddressId}/review`,
      {
        action: actionMapped,
        ...(payload.reason ? { reason: payload.reason } : {}),
      }
    );
    return data;
  },

  // 11. Stove requests (Multiple Stove)
  getStoveRequests: async (params?: {
    search?: string;
    cursor?: string | null;
    limit?: number;
    status?: string;
  }): Promise<GetStoveRequestsResponse> => {
    const { data } = await apiClient.get<GetStoveRequestsResponse>(
      "/admin/v1/stoves/requests",
      { params }
    );
    return data;
  },

  // 12. Review a stove request
  reviewStoveRequest: async (
    requestId: string,
    payload: { action: "approve" | "reject"; reason?: string }
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/stoves/requests/${requestId}/review`,
      {
        action: payload.action,
        ...(payload.reason ? { reason: payload.reason } : {}),
      }
    );
    return data;
  },
};

// ─── Kitchen Addresses ────────────────────────────────────────────────────────
export interface KitchenAddressDetails {
  id: string;
  type?: string;
  recipient?: string | null;
  phone?: string | null;
  line1?: string;
  line2?: string | null;
  landmark?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  approvalStatus?: string; // "pending" | "approved" | "rejected" | "resubmission"
  rejectionReason?: string | null;
  createdAt?: string;
}

export interface KitchenAddressItem {
  id: string;
  chefId?: string;
  chefName?: string;
  displayName?: string;
  businessName?: string;
  phone?: string;
  email?: string | null;
  cityId?: string | null;
  kitchenName?: string;
  address?: KitchenAddressDetails | string;
  line1?: string;
  line2?: string | null;
  landmark?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  approvalStatus?: string; // "pending" | "approved" | "rejected" | "resubmission"
  status?: string;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  documents?: ChefDocument[];
}

export interface GetKitchenAddressesResponse {
  ok: boolean;
  data: {
    items: KitchenAddressItem[];
    total?: number;
    totalCount?: number;
    nextCursor?: string | null;
    statusCounts?: Record<string, number>;
  };
}

// ─── Stove Requests (Multiple Stove) ─────────────────────────────────────────
export interface StoveRequest {
  id: string;
  chefId: string;
  chefName: string;
  chefPhone: string;
  requestedStoves: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetStoveRequestsResponse {
  ok: boolean;
  data: {
    items: StoveRequest[];
    nextCursor: string | null;
    statusCounts?: Record<string, number>;
  };
}

