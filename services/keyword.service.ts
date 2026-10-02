import { apiClient } from "./api";

export interface Keyword {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetKeywordsResponse {
  ok: boolean;
  data: {
    items: Keyword[];
    nextCursor: string | null;
  };
}

export interface CreateKeywordResponse {
  ok: boolean;
  data: Keyword;
}

export const keywordService = {
  getKeywords: async (params?: {
    search?: string;
    active?: boolean;
    limit?: number;
    cursor?: string;
  }): Promise<GetKeywordsResponse> => {
    const { data } = await apiClient.get<GetKeywordsResponse>("/admin/v1/keywords", { params });
    return data;
  },

  createKeyword: async (payload: { name: string; active?: boolean }): Promise<CreateKeywordResponse> => {
    const { data } = await apiClient.post<CreateKeywordResponse>("/admin/v1/keywords", payload);
    return data;
  },

  getKeywordById: async (id: string): Promise<{ ok: boolean; data: Keyword }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Keyword }>(`/admin/v1/keywords/${id}`);
    return data;
  },

  updateKeyword: async (id: string, payload: { active: boolean }): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/keywords/${id}`, payload);
    return data;
  },

  deleteKeyword: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete(`/admin/v1/keywords/${id}`);
    return data;
  },
};
