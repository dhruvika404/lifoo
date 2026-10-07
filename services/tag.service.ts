import { apiClient } from "./api";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  status: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetTagsResponse {
  ok: boolean;
  data: {
    items: Tag[];
    nextCursor: string | null;
  };
}

export interface CreateTagResponse {
  ok: boolean;
  data: Tag;
}

export const tagService = {
  getTags: async (params?: {
    search?: string;
    limit?: number;
    cursor?: string;
    createdAt?: "asc" | "desc";
    isActive?: boolean;
  }): Promise<GetTagsResponse> => {
    const { data } = await apiClient.get<GetTagsResponse>("/admin/v1/tags", { params });
    return data;
  },

  createTag: async (payload: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CreateTagResponse> => {
    const { data } = await apiClient.post<CreateTagResponse>("/admin/v1/tags", payload);
    return data;
  },

  getTagById: async (id: string): Promise<{ ok: boolean; data: Tag }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Tag }>(`/admin/v1/tags/${id}`);
    return data;
  },

  updateTag: async (id: string, payload: Partial<Tag>): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/tags/${id}`, payload);
    return data;
  },

  deleteTag: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete(`/admin/v1/tags/${id}`);
    return data;
  },

  getUploadUrl: async (mimeType: string, tagId?: string): Promise<any> => {
    const { data } = await apiClient.get(`/admin/v1/tags/upload-url`, {
      params: { mimeType, tagId }
    });
    return data;
  }
};
