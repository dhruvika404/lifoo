import { apiClient } from "./api";
import type { ChefDocument, BankAccount as ChefBankAccount } from "./verification.service";

export type { ChefDocument, ChefBankAccount };

export interface ChefUser {
  id: string;
  phone: string;
  email: string | null;
  status: "active" | "inactive" | "suspended" | "blocked";
  preferredLocale?: string | null;
}

export interface Chef {
  userId: string;
  businessName: string;
  displayName: string;
  kycStatus: "pending" | "verified" | "rejected" | "submitted";
  commissionPct: number;
  platformFeePct: number;
  ratingAvg: number | null;
  ratingCount: number;
  joinedAt: string;
  verifiedAt: string | null;
  user: ChefUser;
  onboarding?: ChefOnboarding | null;
}

export interface ChefAddress {
  id: string;
  type: "kitchen" | "residential";
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
  fssaiNumber: string | null;
  fssaiDocument: string | null;
  fssaiStatus: string | null;
  addressProofDocument: string | null;
  addressProofStatus: string | null;
  kitchenPhotoStatus: string | null;
  kitchenVideoStatus: string | null;
  approvalStatus: string | null;
  createdAt: string;
}

export interface ChefOnboardingSection {
  percentage: number;
  approvedPercentage: number;
  items: Record<string, any>;
}

export interface ChefOnboarding {
  overallPercentage: number;
  overallApprovedPercentage: number;
  isEligibleToPublish: boolean;
  sections: Record<string, ChefOnboardingSection>;
}

export interface ChefDetail extends Chef {
  bio: string | null;
  dateOfBirth?: string | null;
  alternatePhone?: string | null;
  experienceYears?: number | null;
  gender?: string | null;
  gstNumber: string | null;
  documents?: ChefDocument[];
  kycDocuments?: ChefDocument[];
  kitchenAddresses: ChefAddress[];
  pendingKitchen?: ChefAddress | null;
  residentialAddress: ChefAddress | null;
  bankAccounts?: ChefBankAccount[];
}

export interface GetChefsResponse {
  ok: boolean;
  data: Chef[] | { items: Chef[]; nextCursor?: string | null };
}

export interface InviteChefPayload {
  businessName: string;
  displayName: string;
  email?: string | null;
  phone: string;
  kycStatus: "pending" | "verified" | "rejected" | "submitted";
  commissionPct: number;
  platformFeePct: number;
  status: "active" | "inactive" | "suspended" | "blocked";
  user?: {
    phone?: string;
    email?: string | null;
    status?: "active" | "inactive" | "suspended" | "blocked";
  };
}

export interface UpdateChefPayload {
  businessName?: string;
  displayName?: string;
  email?: string | null;
  phone?: string;
  kycStatus?: "pending" | "verified" | "rejected" | "submitted";
  commissionPct?: number;
  platformFeePct?: number;
  status?: "active" | "inactive" | "suspended" | "blocked";
  user?: {
    phone?: string;
    email?: string | null;
    status?: "active" | "inactive" | "suspended" | "blocked";
  };
}

export const chefService = {
  // Fetch list of chefs from API with optional search, kycStatus, status filters
  getChefs: async (params?: {
    search?: string;
    status?: string;
    kycStatus?: string;
    limit?: number;
    cursor?: string;
  }): Promise<GetChefsResponse> => {
    const { data } = await apiClient.get<GetChefsResponse>(
      "/admin/v1/chefs",
      { params }
    );
    return data;
  },

  // Fetch details of a single chef by ID
  getChefById: async (chefId: string): Promise<{ ok: boolean; data: ChefDetail }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: ChefDetail }>(
      `/admin/v1/chefs/${chefId}`
    );
    return data;
  },

  // Invite/add a new chef
  inviteChef: async (
    payload: InviteChefPayload
  ): Promise<{ ok: boolean; data: Chef }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: Chef }>(
      "/admin/v1/chefs",
      payload
    );
    return data;
  },

  // Update chef details
  updateChef: async (
    chefId: string,
    payload: UpdateChefPayload
  ): Promise<{ ok: boolean; data: Chef }> => {
    const { data } = await apiClient.put<{ ok: boolean; data: Chef }>(
      `/admin/v1/chefs/${chefId}`,
      payload
    );
    return data;
  },

  // Delete/remove a chef
  deleteChef: async (
    chefId: string
  ): Promise<{ ok: boolean; data: Chef }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: Chef }>(
      `/admin/v1/chefs/${chefId}`
    );
    return data;
  },

  // Suspend a chef
  suspendChef: async (
    chefId: string
  ): Promise<{ ok: boolean; data: Chef }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: Chef }>(
      `/admin/v1/chefs/${chefId}/suspend`,
      { status: "suspended" }
    );
    return data;
  },

  // Activate a suspended chef
  activateChef: async (
    chefId: string
  ): Promise<{ ok: boolean; data: Chef }> => {
    const { data } = await apiClient.put<{ ok: boolean; data: Chef }>(
      `/admin/v1/chefs/${chefId}`,
      { status: "active", kycStatus: "pending" }
    );
    return data;
  },

  // Approve pending kitchen address for a chef
  approveAddress: async (
    chefId: string,
    addressId: string
  ): Promise<{ ok: boolean; data: any }> => {
    const { data } = await apiClient.post<{ ok: boolean; data: any }>(
      `/admin/v1/chefs/${chefId}/approve-address`,
      { addressId: addressId }
    );
    return data;
  },
};
