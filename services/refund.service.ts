import { apiClient } from "./api";

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  createdAt: string;
  notes?: string;
}

export interface GetRefundsResponse {
  ok: boolean;
  data: {
    items: RefundRequest[];
    total: number;
  };
}

// MOCK DATA GENERATOR
const generateMockRefunds = (): RefundRequest[] => {
  const reasons = [
    "Food arrived cold",
    "Missing items in order",
    "Chef cancelled order",
    "Quality not up to standard",
    "Extremely late delivery"
  ];
  return Array.from({ length: 25 }, (_, i) => ({
    id: `RFD-${3000 + i}`,
    orderId: `ORD-${8000 + i}`,
    customerId: `CUST-${100 + i}`,
    customerName: `Customer ${i}`,
    amount: 150 + (i * 20),
    reason: reasons[i % reasons.length],
    status: i % 4 === 0 ? "approved" : i % 5 === 0 ? "rejected" : i % 7 === 0 ? "processed" : "pending",
    createdAt: new Date(Date.now() - i * 14400000).toISOString(),
    notes: i % 3 === 0 ? "Customer provided photos of missing items." : undefined,
  }));
};

const mockRefunds = generateMockRefunds();

export const refundService = {
  getRefunds: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    status?: string;
  }): Promise<GetRefundsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filtered = [...mockRefunds];

    if (params?.status) {
      filtered = filtered.filter((r) => r.status === params.status);
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(searchLower) ||
          r.orderId.toLowerCase().includes(searchLower) ||
          r.customerName.toLowerCase().includes(searchLower)
      );
    }

    const limit = params?.limit || 10;
    const startIndex = params?.cursor ? parseInt(params.cursor, 10) : 0;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      ok: true,
      data: {
        items: paginatedItems,
        total: filtered.length,
      },
    };
  },

  updateRefundStatus: async (
    id: string,
    payload: { status: "approved" | "rejected" | "processed"; notes?: string }
  ): Promise<{ ok: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simulate updating mock data
    const idx = mockRefunds.findIndex(r => r.id === id);
    if (idx !== -1) {
      mockRefunds[idx].status = payload.status;
      if (payload.notes) mockRefunds[idx].notes = payload.notes;
    }

    return { ok: true };
  },
};
