import { create } from "zustand";
import { cityService, City, CreateCityPayload, UpdateCityPayload } from "@/services/city.service";

interface CityState {
  // Cities State
  cities: City[];
  isLoadingCities: boolean;
  citiesError: string | null;
  citiesLimit: number;
  citiesCurrentPageCursor: string | null;
  citiesNextCursor: string | null;
  citiesHistory: (string | null)[];
  citiesTotal: number;

  // Cities Filters
  citiesSearch: string;
  citiesIsActiveFilter: boolean | undefined;

  // Cities Actions
  setCitiesLimit: (limit: number) => Promise<void>;
  setCitiesFilters: (filters: {
    search?: string;
    isActive?: boolean | undefined;
  }) => Promise<void>;
  resetCitiesFilters: () => Promise<void>;
  fetchCities: () => Promise<void>;
  goToNextCitiesPage: () => Promise<void>;
  goToPreviousCitiesPage: () => Promise<void>;
  createCity: (payload: CreateCityPayload) => Promise<void>;
  updateCity: (id: string, payload: UpdateCityPayload) => Promise<void>;
}

export const useCityStore = create<CityState>((set, get) => ({
  // Cities Initial State
  cities: [],
  isLoadingCities: false,
  citiesError: null,
  citiesLimit: 10,
  citiesCurrentPageCursor: null,
  citiesNextCursor: null,
  citiesHistory: [],
  citiesTotal: 0,
  citiesSearch: "",
  citiesIsActiveFilter: undefined,

  // Cities Actions
  setCitiesLimit: async (limit: number) => {
    set({ citiesLimit: limit, citiesCurrentPageCursor: null, citiesHistory: [], citiesNextCursor: null });
    await get().fetchCities();
  },

  setCitiesFilters: async (filters) => {
    set({
      ...(filters.search !== undefined && { citiesSearch: filters.search }),
      ...(filters.isActive !== undefined && { citiesIsActiveFilter: filters.isActive }),
      citiesCurrentPageCursor: null,
      citiesHistory: [],
      citiesNextCursor: null,
    });
    await get().fetchCities();
  },

  resetCitiesFilters: async () => {
    set({
      citiesSearch: "",
      citiesIsActiveFilter: undefined,
      citiesCurrentPageCursor: null,
      citiesHistory: [],
      citiesNextCursor: null,
    });
    await get().fetchCities();
  },

  fetchCities: async () => {
    set({ isLoadingCities: true, citiesError: null });
    try {
      const {
        citiesLimit,
        citiesCurrentPageCursor,
        citiesSearch,
        citiesIsActiveFilter,
      } = get();

      const res = await cityService.getCities({
        limit: citiesLimit,
        cursor: citiesCurrentPageCursor ?? undefined,
        search: citiesSearch || undefined,
        isActive: citiesIsActiveFilter,
      });

      if (res.ok && res.data) {
        set({
          cities: res.data.items || [],
          citiesTotal: res.data.total || 0,
          citiesNextCursor: res.data.nextCursor || null,
          citiesError: null,
        });
      } else {
        set({ citiesError: "Failed to fetch cities" });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error("[useCityStore] fetchCities error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to fetch cities";
      set({ citiesError: errMsg });
    } finally {
      set({ isLoadingCities: false });
    }
  },

  goToNextCitiesPage: async () => {
    const { citiesNextCursor, citiesCurrentPageCursor, citiesHistory } = get();
    if (!citiesNextCursor) return;
    set({
      citiesHistory: [...citiesHistory, citiesCurrentPageCursor],
      citiesCurrentPageCursor: citiesNextCursor,
    });
    await get().fetchCities();
  },

  goToPreviousCitiesPage: async () => {
    const { citiesHistory } = get();
    if (citiesHistory.length === 0) return;
    const newHistory = [...citiesHistory];
    const prevCursor = newHistory.pop()!;
    set({
      citiesHistory: newHistory,
      citiesCurrentPageCursor: prevCursor,
    });
    await get().fetchCities();
  },

  createCity: async (payload) => {
    set({ isLoadingCities: true, citiesError: null });
    try {
      const res = await cityService.createCity(payload);
      if (res.ok) {
        await get().fetchCities();
      } else {
        throw new Error("Failed to create city");
      }
    } catch (err: any) {
      console.error("[useCityStore] createCity error:", err);
      throw err;
    } finally {
      set({ isLoadingCities: false });
    }
  },

  updateCity: async (id, payload) => {
    try {
      const res = await cityService.updateCity(id, payload);
      if (res.ok && res.data) {
        set((state) => ({
          cities: state.cities.map((c) => (c.id === id ? res.data : c)),
        }));
      } else {
        throw new Error("Failed to update city");
      }
    } catch (err: any) {
      console.error("[useCityStore] updateCity error:", err);
      throw err;
    }
  },
}));
