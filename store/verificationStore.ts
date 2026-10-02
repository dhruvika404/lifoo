import { create } from "zustand";
import {
  verificationService,
  ProfileVerificationItem,
  BankVerificationItem,
  DocumentVerificationItem,
  ProductVerification,
  KitchenAddressItem,
  StoveRequest,
  ReviewPayload,
} from "@/services/verification.service";

// ─── State Shape ──────────────────────────────────────────────────────────────
interface VerificationState {
  // ── Profile Tab ─────────────────────────────────────────────────────────────
  profiles: ProfileVerificationItem[];
  profilesLoading: boolean;
  profilesError: string | null;
  profilesCursor: string | null;
  profilesStatusCounts: Record<string, number> | null;

  // ── Bank Accounts Tab ────────────────────────────────────────────────────────
  bankAccounts: BankVerificationItem[];
  bankAccountsLoading: boolean;
  bankAccountsError: string | null;
  bankAccountsCursor: string | null;
  bankAccountsStatusCounts: Record<string, number> | null;

  // ── Documents Tab ────────────────────────────────────────────────────────────
  documents: DocumentVerificationItem[];
  documentsLoading: boolean;
  documentsError: string | null;
  documentsCursor: string | null;
  documentsStatusCounts: Record<string, number> | null;

  // ── Products (Menu) Tab ──────────────────────────────────────────────────────
  products: ProductVerification[];
  productsLoading: boolean;
  productsError: string | null;
  productsCursor: string | null;
  productsStatusCounts: Record<string, number> | null;

  // ── Multiple Kitchen Addresses Tab ───────────────────────────────────────────
  kitchenAddresses: KitchenAddressItem[];
  kitchenAddressesLoading: boolean;
  kitchenAddressesError: string | null;
  kitchenAddressesCursor: string | null;
  kitchenAddressesTotal: number;
  kitchenAddressesStatusCounts: Record<string, number> | null;

  // ── Multiple Stoves Tab ──────────────────────────────────────────────────────
  stoves: StoveRequest[];
  stovesLoading: boolean;
  stovesError: string | null;
  stovesCursor: string | null;
  stovesStatusCounts: Record<string, number> | null;

  // ── Action Loading ───────────────────────────────────────────────────────────
  isReviewing: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────────
  fetchProfiles: (params?: {
    search?: string;
    cityId?: string;
    status?: string;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;

  fetchBankAccounts: (params?: {
    search?: string;
    status?: string;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;

  fetchDocuments: (params?: {
    search?: string;
    status?: string;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;

  fetchProducts: (params?: {
    search?: string;
    status?: string;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;

  fetchKitchenAddresses: (params?: {
    search?: string;
    page?: number;
    status?: string;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;

  fetchStoves: (params?: {
    search?: string;
    status?: string;
    cursor?: string | null;
    limit?: number;
  }) => Promise<void>;

  reviewProfileAddress: (addressId: string, payload: ReviewPayload) => Promise<void>;
  reviewBankAccount: (bankAccountId: string, payload: ReviewPayload) => Promise<void>;
  reviewDocument: (documentId: string, payload: ReviewPayload) => Promise<void>;
  reviewProduct: (productId: string, payload: ReviewPayload) => Promise<void>;
  reviewKitchenAddress: (kitchenAddressId: string, payload: ReviewPayload) => Promise<void>;
  reviewStove: (requestId: string, payload: { action: "approve" | "reject"; reason?: string }) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useVerificationStore = create<VerificationState>((set) => ({
  // ── Initial State ─────────────────────────────────────────────────────────────
  profiles: [],
  profilesLoading: false,
  profilesError: null,
  profilesCursor: null,
  profilesStatusCounts: null,

  bankAccounts: [],
  bankAccountsLoading: false,
  bankAccountsError: null,
  bankAccountsCursor: null,
  bankAccountsStatusCounts: null,

  documents: [],
  documentsLoading: false,
  documentsError: null,
  documentsCursor: null,
  documentsStatusCounts: null,

  products: [],
  productsLoading: false,
  productsError: null,
  productsCursor: null,
  productsStatusCounts: null,

  kitchenAddresses: [],
  kitchenAddressesLoading: false,
  kitchenAddressesError: null,
  kitchenAddressesCursor: null,
  kitchenAddressesTotal: 0,
  kitchenAddressesStatusCounts: null,

  stoves: [],
  stovesLoading: false,
  stovesError: null,
  stovesCursor: null,
  stovesStatusCounts: null,

  isReviewing: false,

  // ── Fetch Profiles ───────────────────────────────────────────────────────────
  fetchProfiles: async (params) => {
    set({ profilesLoading: true, profilesError: null });
    try {
      const response = await verificationService.getProfiles({
        search: params?.search || undefined,
        cityId: params?.cityId || undefined,
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 20,
        status: params?.status,
      });
      if (response?.ok) {
        set((state) => ({
          profiles: params?.cursor ? [...state.profiles, ...(response.data?.items ?? [])] : (response.data?.items ?? []),
          profilesCursor: response.data?.nextCursor ?? null,
          profilesStatusCounts: response.data?.statusCounts ?? null,
          profilesError: null,
        }));
      } else {
        set({ profilesError: "Failed to load profile verifications" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      set({ profilesError: err?.response?.data?.message || err?.message || "Failed to fetch profiles" });
    } finally {
      set({ profilesLoading: false });
    }
  },

  // ── Fetch Bank Accounts ──────────────────────────────────────────────────────
  fetchBankAccounts: async (params) => {
    set({ bankAccountsLoading: true, bankAccountsError: null });
    try {
      const response = await verificationService.getBankAccounts({
        search: params?.search || undefined,
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 20,
        status: params?.status,
      });
      if (response?.ok) {
        set((state) => ({
          bankAccounts: params?.cursor ? [...state.bankAccounts, ...(response.data?.items ?? [])] : (response.data?.items ?? []),
          bankAccountsCursor: response.data?.nextCursor ?? null,
          bankAccountsStatusCounts: response.data?.statusCounts ?? null,
          bankAccountsError: null,
        }));
      } else {
        set({ bankAccountsError: "Failed to load bank account verifications" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      set({ bankAccountsError: err?.response?.data?.message || err?.message || "Failed to fetch bank accounts" });
    } finally {
      set({ bankAccountsLoading: false });
    }
  },

  // ── Fetch Documents ──────────────────────────────────────────────────────────
  fetchDocuments: async (params) => {
    set({ documentsLoading: true, documentsError: null });
    try {
      const response = await verificationService.getDocuments({
        search: params?.search || undefined,
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 20,
        status: params?.status,
      });
      if (response?.ok) {
        set((state) => ({
          documents: params?.cursor ? [...state.documents, ...(response.data?.items ?? [])] : (response.data?.items ?? []),
          documentsCursor: response.data?.nextCursor ?? null,
          documentsStatusCounts: response.data?.statusCounts ?? null,
          documentsError: null,
        }));
      } else {
        set({ documentsError: "Failed to load document verifications" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      set({ documentsError: err?.response?.data?.message || err?.message || "Failed to fetch documents" });
    } finally {
      set({ documentsLoading: false });
    }
  },

  // ── Fetch Products ───────────────────────────────────────────────────────────
  fetchProducts: async (params) => {
    set({ productsLoading: true, productsError: null });
    try {
      const response = await verificationService.getProducts({
        search: params?.search || undefined,
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 20,
        status: params?.status,
      });
      if (response?.ok) {
        set((state) => ({
          products: params?.cursor ? [...state.products, ...(response.data?.items ?? [])] : (response.data?.items ?? []),
          productsCursor: response.data?.nextCursor ?? null,
          productsStatusCounts: response.data?.statusCounts ?? null,
          productsError: null,
        }));
      } else {
        set({ productsError: "Failed to load product verifications" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      set({ productsError: err?.response?.data?.message || err?.message || "Failed to fetch products" });
    } finally {
      set({ productsLoading: false });
    }
  },

  // ── Review Profile Address ───────────────────────────────────────────────────
  reviewProfileAddress: async (addressId, payload) => {
    set({ isReviewing: true });
    try {
      await verificationService.reviewProfileAddress(addressId, payload);
      const newStatus = payload.action === "approve" ? "approved"
        : payload.action === "reject" ? "rejected" : "pending";
      set((state) => ({
        profiles: state.profiles.map((chef) => ({
          ...chef,
          addresses: chef.addresses.map((addr) =>
            addr.id === addressId
              ? { ...addr, approvalStatus: newStatus, rejectionReason: payload.reason ?? null }
              : addr
          ),
        })),
      }));
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  // ── Review Bank Account ──────────────────────────────────────────────────────
  reviewBankAccount: async (bankAccountId, payload) => {
    set({ isReviewing: true });
    try {
      await verificationService.reviewBankAccount(bankAccountId, payload);
      const newStatus = payload.action === "approve" ? "approved"
        : payload.action === "reject" ? "rejected" : "pending";
      set((state) => ({
        bankAccounts: state.bankAccounts.map((chef) => ({
          ...chef,
          bankAccounts: chef.bankAccounts.map((acct) =>
            acct.id === bankAccountId
              ? { ...acct, approvalStatus: newStatus, rejectionReason: payload.reason ?? null }
              : acct
          ),
        })),
      }));
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  // ── Review Document ──────────────────────────────────────────────────────────
  reviewDocument: async (documentId, payload) => {
    set({ isReviewing: true });
    try {
      await verificationService.reviewDocument(documentId, payload);
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  // ── Review Product ───────────────────────────────────────────────────────────
  reviewProduct: async (productId, payload) => {
    set({ isReviewing: true });
    try {
      await verificationService.reviewProduct(productId, payload);
      const newStatus = payload.action === "approve" ? "active"
        : payload.action === "reject" ? "rejected" : "pending";
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId
            ? { ...p, status: newStatus, rejectionReason: payload.reason ?? null }
            : p
        ),
      }));
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  // ── Fetch Kitchen Addresses ──────────────────────────────────────────────────
  fetchKitchenAddresses: async (params) => {
    set({ kitchenAddressesLoading: true, kitchenAddressesError: null });
    try {
      const response = await verificationService.getKitchenAddresses({
        search: params?.search || undefined,
        page: params?.page,
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 10,
        status: params?.status,
      });
      if (response?.ok) {
        const items = response.data?.items ?? [];
        const total = response.data?.total ?? response.data?.totalCount ?? items.length;
        set({
          kitchenAddresses: items,
          kitchenAddressesTotal: total,
          kitchenAddressesCursor: response.data?.nextCursor ?? null,
          kitchenAddressesStatusCounts: response.data?.statusCounts ?? null,
          kitchenAddressesError: null,
        });
      } else {
        set({ kitchenAddressesError: "Failed to load kitchen address verifications" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      set({
        kitchenAddressesError:
          err?.response?.data?.message || err?.message || "Failed to fetch kitchen addresses",
      });
    } finally {
      set({ kitchenAddressesLoading: false });
    }
  },

  // ── Fetch Stoves (Stove Requests) ───────────────────────────────────────────
  fetchStoves: async (params) => {
    set({ stovesLoading: true, stovesError: null });
    try {
      const response = await verificationService.getStoveRequests({
        search: params?.search,
        cursor: params?.cursor ?? null,
        limit: params?.limit ?? 20,
        status: params?.status,
      });
      if (response?.ok) {
        set({
          stoves: response.data?.items ?? [],
          stovesCursor: response.data?.nextCursor ?? null,
          stovesStatusCounts: response.data?.statusCounts ?? null,
          stovesError: null,
        });
      } else {
        set({ stovesError: "Failed to load stove requests" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      set({
        stovesError:
          err?.response?.data?.message || err?.message || "Failed to fetch stove requests",
      });
    } finally {
      set({ stovesLoading: false });
    }
  },

  // ── Review Kitchen Address ───────────────────────────────────────────────────
  reviewKitchenAddress: async (kitchenAddressId, payload) => {
    set({ isReviewing: true });
    try {
      await verificationService.reviewKitchenAddress(kitchenAddressId, payload);
      const newStatus =
        payload.action === "approve"
          ? "approved"
          : payload.action === "reject"
          ? "rejected"
          : "resubmission";
      set((state) => ({
        kitchenAddresses: state.kitchenAddresses.map((item) =>
          item.id === kitchenAddressId
            ? {
                ...item,
                approvalStatus: newStatus,
                status: newStatus,
                rejectionReason: payload.reason ?? null,
                address:
                  typeof item.address === "object" && item.address !== null
                    ? {
                        ...item.address,
                        approvalStatus: newStatus,
                        rejectionReason: payload.reason ?? null,
                      }
                    : item.address,
              }
            : item
        ),
      }));
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },

  // ── Review Stove Request ──────────────────────────────────────────────────
  reviewStove: async (requestId, payload) => {
    set({ isReviewing: true });
    try {
      await verificationService.reviewStoveRequest(requestId, payload);
      const newStatus = payload.action === "approve" ? "approved" : "rejected";
      set((state) => ({
        stoves: state.stoves.map((item) =>
          item.id === requestId
            ? { ...item, status: newStatus as "approved" | "rejected" }
            : item
        ),
      }));
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      throw err;
    } finally {
      set({ isReviewing: false });
    }
  },
}));
