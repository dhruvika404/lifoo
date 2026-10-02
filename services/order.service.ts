import { apiClient } from "./api";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface OrderAddress {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: "pending" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  paymentMethod: "card" | "upi" | "cod";
  createdAt: string;
  notes?: string;
  slotId?: string;
}

export interface GetOrdersResponse {
  ok: boolean;
  data: {
    items: Order[];
    nextCursor: string | null;
    total: number;
  };
}

export interface GetOrderResponse {
  ok: boolean;
  data: Order;
}

// Mock Data for UI demonstration
const generateMockOrders = (): Order[] => {
  return Array.from({ length: 25 }).map((_, i) => ({
    id: `ORD-${10000 + i}`,
    customer: {
      id: `CUST-${i}`,
      name: `Customer ${i + 1}`,
      phone: `+91 987654321${i % 10}`,
      email: `customer${i + 1}@example.com`,
    },
    address: {
      line1: `${12 + i} Main St`,
      city: "Mumbai",
      state: "MH",
      pincode: "400001",
    },
    items: [
      {
        id: `ITEM-${i}-1`,
        productId: `PROD-${i}-1`,
        productName: `Delicious Meal ${i + 1}`,
        quantity: 1 + (i % 3),
        price: 250 + (i * 10),
      }
    ],
    subtotal: 250 + (i * 10),
    tax: 25,
    deliveryFee: 40,
    discount: 0,
    total: 315 + (i * 10),
    status: ["pending", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"][i % 6] as Order["status"],
    paymentStatus: i % 5 === 0 ? "unpaid" : "paid",
    paymentMethod: i % 2 === 0 ? "upi" : "card",
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    notes: i % 4 === 0 ? "Please deliver fast" : undefined,
    slotId: i % 3 === 0 ? "SLOT-123" : `SLOT-${i}`,
  }));
};

const mockOrders = generateMockOrders();

export const orderService = {
  getOrders: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    status?: string;
    slotId?: string;
  }): Promise<GetOrdersResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filtered = [...mockOrders];

    if (params?.slotId) {
      filtered = filtered.filter((o) => o.slotId === params.slotId);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchLower) ||
          o.customer.name.toLowerCase().includes(searchLower) ||
          o.customer.phone.includes(params.search!)
      );
    }

    if (params?.status && params.status !== "all") {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    const limit = params?.limit || 10;
    const startIndex = params?.cursor ? parseInt(params.cursor, 10) : 0;
    const paginated = filtered.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < filtered.length ? String(startIndex + limit) : null;

    return {
      ok: true,
      data: {
        items: paginated,
        nextCursor,
        total: filtered.length,
      },
    };
  },

  getOrder: async (orderId: string): Promise<GetOrderResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    return { ok: true, data: order };
  },

  updateOrderStatus: async (
    orderId: string,
    status: Order["status"]
  ): Promise<{ ok: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex > -1) {
      mockOrders[orderIndex].status = status;
    }
    return { ok: true };
  },
};
