import { apiClient } from "./api";

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  userType: "customer" | "chef";
  amount: number;
  type: "topup" | "earning" | "deduction" | "refund" | "payout";
  status: "success" | "pending" | "failed";
  createdAt: string;
  referenceId?: string; // e.g. order ID or payout ID
}

export interface GetWalletTransactionsResponse {
  ok: boolean;
  data: {
    items: WalletTransaction[];
    total: number;
  };
}

export interface WalletStats {
  totalBalance: number;
  totalTopups: number;
  totalPayouts: number;
}

export interface GetWalletStatsResponse {
  ok: boolean;
  data: WalletStats;
}

// MOCK DATA GENERATOR
const generateMockTransactions = (): WalletTransaction[] => {
  return Array.from({ length: 45 }, (_, i) => {
    const types: WalletTransaction["type"][] = ["topup", "earning", "deduction", "refund", "payout"];
    const type = types[i % types.length];
    
    let amount = 0;
    if (type === "topup") amount = 500 + (i * 100);
    if (type === "earning") amount = 200 + (i * 50);
    if (type === "deduction") amount = -50;
    if (type === "refund") amount = 300 + (i * 20);
    if (type === "payout") amount = -1000 - (i * 100);

    return {
      id: `TXN-W-${1000 + i}`,
      userId: `USR-${i}`,
      userName: i % 2 === 0 ? `Customer ${i}` : `Chef ${i}`,
      userType: i % 2 === 0 ? "customer" : "chef",
      amount,
      type,
      status: i % 10 === 0 ? "failed" : i % 5 === 0 ? "pending" : "success",
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      referenceId: type !== "topup" ? `REF-${2000 + i}` : undefined,
    };
  });
};

const mockTransactions = generateMockTransactions();

export const walletService = {
  getTransactions: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<GetWalletTransactionsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filtered = [...mockTransactions];

    if (params?.type) {
      filtered = filtered.filter((t) => t.type === params.type);
    }
    if (params?.status) {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(searchLower) ||
          t.userName.toLowerCase().includes(searchLower) ||
          t.userId.toLowerCase().includes(searchLower) ||
          (t.referenceId && t.referenceId.toLowerCase().includes(searchLower))
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

  getStats: async (): Promise<GetWalletStatsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      ok: true,
      data: {
        totalBalance: 1250000,
        totalTopups: 850000,
        totalPayouts: 420000,
      },
    };
  },

  adjustBalance: async (
    userId: string,
    payload: { amount: number; reason: string; type: "credit" | "debit" }
  ): Promise<{ ok: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { ok: true };
  },
};
