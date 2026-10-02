import { apiClient } from "./api";

export interface CustomerAddress {
  id: string;
  type: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  latitude: number;
  longitude: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  joined: string;
  joinedAt?: string;
  orders: number;
  totalSpend: number;
  wallet: number;
  status: "active" | "suspended" | "blocked";
  photoUrl?: string;
  marketingOptIn?: boolean;
  referralCode?: string | null;
  addresses?: CustomerAddress[];
}

export interface GetCustomersResponse {
  ok: boolean;
  data: {
    items: Customer[];
    nextCursor: string | null;
  };
}

export interface GetCustomerResponse {
  ok: boolean;
  data: Customer;
}

export const customerService = {
  getCustomers: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    status?: string;
  }): Promise<GetCustomersResponse> => {
    const { data } = await apiClient.get<GetCustomersResponse>(
      "/admin/v1/customers",
      { params }
    );
    return data;
  },

  getCustomer: async (customerId: string): Promise<GetCustomerResponse> => {
    const { data } = await apiClient.get<GetCustomerResponse>(
      `/admin/v1/customers/${customerId}`
    );
    return data;
  },

  updateCustomerStatus: async (
    customerId: string,
    status: "active" | "suspended" | "blocked"
  ): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.patch<{ ok: boolean }>(
      `/admin/v1/customers/${customerId}/status`,
      { status }
    );
    return data;
  },
};
