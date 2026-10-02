import { apiClient } from "./api";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: DeliveryAddress;
  dropoffAddress: DeliveryAddress;
  status: "unassigned" | "assigned" | "in_transit" | "delivered" | "failed";
  rider?: Rider | null;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

export interface GetDeliveriesResponse {
  ok: boolean;
  data: {
    items: Delivery[];
    nextCursor: string | null;
    total: number;
  };
}

export interface GetDeliveryResponse {
  ok: boolean;
  data: Delivery;
}

// Mock Data
const mockRiders: Rider[] = [
  { id: "RIDER-1", name: "Rahul Singh", phone: "+91 9876543220", vehicle: "Bike (MH-01-AB-1234)" },
  { id: "RIDER-2", name: "Amit Patel", phone: "+91 9876543221", vehicle: "Scooter (MH-02-CD-5678)" },
  { id: "RIDER-3", name: "Vikram Sharma", phone: "+91 9876543222", vehicle: "Bike (MH-03-EF-9012)" },
];

const generateMockDeliveries = (): Delivery[] => {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `DEL-${1000 + i}`,
    orderId: `ORD-${10000 + i}`,
    customerName: `Customer ${i + 1}`,
    customerPhone: `+91 987654321${i % 10}`,
    pickupAddress: {
      line1: `Kitchen Center ${1 + (i % 3)}`,
      city: "Mumbai",
      state: "MH",
      pincode: "400050",
    },
    dropoffAddress: {
      line1: `${12 + i} Main St`,
      city: "Mumbai",
      state: "MH",
      pincode: "400001",
    },
    status: ["unassigned", "assigned", "in_transit", "delivered", "failed"][i % 5] as Delivery["status"],
    rider: i % 5 === 0 ? null : mockRiders[i % 3], // unassigned gets null rider
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + (2 - i) * 1800000).toISOString(),
  }));
};

const mockDeliveries = generateMockDeliveries();

export const deliveryService = {
  getDeliveries: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    status?: string;
  }): Promise<GetDeliveriesResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filtered = [...mockDeliveries];

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.id.toLowerCase().includes(searchLower) ||
          d.orderId.toLowerCase().includes(searchLower) ||
          d.rider?.name.toLowerCase().includes(searchLower)
      );
    }

    if (params?.status && params.status !== "all") {
      filtered = filtered.filter((d) => d.status === params.status);
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

  getDelivery: async (deliveryId: string): Promise<GetDeliveryResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const delivery = mockDeliveries.find((d) => d.id === deliveryId);
    if (!delivery) throw new Error("Delivery not found");
    return { ok: true, data: delivery };
  },

  updateDeliveryStatus: async (
    deliveryId: string,
    status: Delivery["status"]
  ): Promise<{ ok: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const idx = mockDeliveries.findIndex((d) => d.id === deliveryId);
    if (idx > -1) {
      mockDeliveries[idx].status = status;
    }
    return { ok: true };
  },

  assignRider: async (
    deliveryId: string,
    riderId: string
  ): Promise<{ ok: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const idx = mockDeliveries.findIndex((d) => d.id === deliveryId);
    if (idx > -1) {
      const rider = mockRiders.find(r => r.id === riderId);
      if(rider) {
        mockDeliveries[idx].rider = rider;
        mockDeliveries[idx].status = "assigned";
      }
    }
    return { ok: true };
  }
};
