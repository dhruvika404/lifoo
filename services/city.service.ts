import { apiClient } from "./api";

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  isActive: boolean;
  launchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCitiesResponse {
  ok: boolean;
  data: {
    items: City[];
    total: number;
    nextCursor?: string | null;
  };
}

export interface CreateCityPayload {
  name: string;
  slug: string;
  state: string;
  country: string;
  isActive: boolean;
}

export interface UpdateCityPayload {
  name?: string;
  slug?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
}

export interface CityResponse {
  ok: boolean;
  data: City;
}

export const cityService = {
  getCities: async (params?: {
    limit?: number;
    cursor?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<GetCitiesResponse> => {
    const { data } = await apiClient.get<GetCitiesResponse>(
      "/admin/v1/cities",
      { params }
    );
    return data;
  },

  getCity: async (cityId: string): Promise<CityResponse> => {
    const { data } = await apiClient.get<CityResponse>(
      `/admin/v1/cities/${cityId}`
    );
    return data;
  },

  createCity: async (payload: CreateCityPayload): Promise<CityResponse> => {
    const { data } = await apiClient.post<CityResponse>(
      "/admin/v1/cities",
      payload
    );
    return data;
  },

  updateCity: async (
    cityId: string,
    payload: UpdateCityPayload
  ): Promise<CityResponse> => {
    const { data } = await apiClient.put<CityResponse>(
      `/admin/v1/cities/${cityId}`,
      payload
    );
    return data;
  },
};
