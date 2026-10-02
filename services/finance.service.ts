import { apiClient } from "./api";

export interface PayoutRequest {
  id: string;
  chefId: string;
  chefName: string;
  bankInfo: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface GetPayoutsResponse {
  ok: boolean;
  data: {
    items: PayoutRequest[];
    total: number;
  };
}

// MOCK DATA GENERATOR
const generateMockPayouts = (): PayoutRequest[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `PAY-${5000 + i}`,
    chefId: `CHF-${200 + i}`,
    chefName: `Chef ${i}`,
    bankInfo: {
      accountNumber: `XXXXXXXX${1000 + i}`,
      ifsc: `HDFC000${100 + i}`,
      bankName: i % 2 === 0 ? "HDFC Bank" : "ICICI Bank",
    },
    amount: 15000 + (i * 1000),
    status: i % 4 === 0 ? "completed" : i % 7 === 0 ? "failed" : i % 3 === 0 ? "processing" : "pending",
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    processedAt: i % 4 === 0 ? new Date(Date.now() - (i - 1) * 86400000).toISOString() : undefined,
    notes: i % 7 === 0 ? "Invalid IFSC code provided" : undefined,
  }));
};

const mockPayouts = generateMockPayouts();

export const financeService = {
  getPayouts: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    status?: string;
  }): Promise<GetPayoutsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filtered = [...mockPayouts];

    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.id.toLowerCase().includes(searchLower) ||
          p.chefName.toLowerCase().includes(searchLower) ||
          p.bankInfo.accountNumber.toLowerCase().includes(searchLower)
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

  updatePayoutStatus: async (
    id: string,
    payload: { status: "processing" | "completed" | "failed"; notes?: string }
  ): Promise<{ ok: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simulate updating mock data
    const idx = mockPayouts.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockPayouts[idx].status = payload.status;
      if (payload.status === "completed") {
        mockPayouts[idx].processedAt = new Date().toISOString();
      }
      if (payload.notes) mockPayouts[idx].notes = payload.notes;
    }

    return { ok: true };
  },
};
