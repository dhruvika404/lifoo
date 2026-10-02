import { apiClient } from "./api";

// ── Response Types ─────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  description: string | null;
  complianceRegime: string;
  sortOrder: number;
  active: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  tags?: string[];
}

export interface GetCategoriesResponse {
  ok: boolean;
  data: Category[] | { items: Category[]; nextCursor?: string | null };
}

export interface GetUploadUrlResponse {
  data: {
    categoryId: string;
    presignedUrl: string;
    s3Key: string;
  };
}

export interface CreateCategoryPayload {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  complianceRegime: string;
  tags?: string[];
}

export interface CreateCategoryResponse {
  ok: boolean;
  data: Category;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  complianceRegime?: string;
  active?: boolean;
  tags?: string[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const categoryService = {

  // List all categories (with optional limit + parentId + cursor + search + complianceRegime + active + createdAt)
  getCategories: async (params?: {
    limit?: number;
    parentId?: string | null;
    cursor?: string;
    search?: string;
    complianceRegime?: string;
    active?: boolean;
    createdAt?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<GetCategoriesResponse> => {
    const { data } = await apiClient.get<GetCategoriesResponse>(
      "/admin/v1/categories",
      { params }
    );
    return data;
  },

  // Fetch a single category by ID
  getCategory: async (categoryId: string): Promise<{ ok: boolean; data: Category }> => {
    const { data } = await apiClient.get<{ ok: boolean; data: Category }>(
      `/admin/v1/categories/${categoryId}`
    );
    return data;
  },

  // Step 1 — get presigned S3 URL + categoryId + s3Key
  getUploadUrl: async (mimeType: string): Promise<GetUploadUrlResponse> => {
    const { data } = await apiClient.get<GetUploadUrlResponse>(
      `/admin/v1/categories/upload-url?mimeType=${encodeURIComponent(mimeType)}`
    );
    return data;
  },

  // Step 3 — create the category using categoryId + s3Key from Step 1
  createCategory: async (
    payload: CreateCategoryPayload
  ): Promise<CreateCategoryResponse> => {
    const { data } = await apiClient.post<CreateCategoryResponse>(
      "/admin/v1/categories",
      payload
    );
    return data;
  },

  // Update an existing category
  updateCategory: async (
    categoryId: string,
    payload: UpdateCategoryPayload
  ): Promise<{ ok: boolean; data: Category }> => {
    const { data } = await apiClient.patch<{ ok: boolean; data: Category }>(
      `/admin/v1/categories/${categoryId}`,
      payload
    );
    return data;
  },

  // Delete a category
  deleteCategory: async (
    categoryId: string
  ): Promise<{ ok: boolean; data: Category }> => {
    const { data } = await apiClient.delete<{ ok: boolean; data: Category }>(
      `/admin/v1/categories/${categoryId}`
    );
    return data;
  },

  // Toggle category status (active ↔ disabled)
  toggleCategoryStatus: async (
    categoryId: string,
    currentActive: boolean
  ): Promise<{ ok: boolean; data: Category }> => {
    const action = currentActive ? "disable" : "enable";
    const { data } = await apiClient.put<{ ok: boolean; data: Category }>(
      `/admin/v1/categories/${categoryId}/${action}`
    );
    return data;
  },

  // Bulk upload categories from a file
  bulkUploadCategories: async (
    file: File,
    sheetName?: string
  ): Promise<{
    isBlob: boolean;
    blob?: Blob;
    filename?: string;
    json?: any;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    if (sheetName && sheetName.trim()) {
      formData.append("sheetName", sheetName.trim());
    }
    const response = await apiClient.post(
      "/admin/v1/categories/bulk-upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      }
    );

    const contentType = response.headers["content-type"];
    if (typeof contentType === "string" && contentType.includes("application/json")) {
      const text = await response.data.text();
      const json = JSON.parse(text);
      return { isBlob: false, json };
    } else {
      const contentDisposition = response.headers["content-disposition"];
      let filename = "failed_categories.xlsx";
      if (typeof contentDisposition === "string") {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      return { isBlob: true, blob: response.data, filename };
    }
  },

  // Reorder categories
  reorderCategories: async (
    payload: { updates: { id: string; sortOrder: number }[] }
  ): Promise<{ ok: boolean }> => {
    console.log(
      "[categoryService] Reorder Request Payload:",
      JSON.stringify(payload, null, 2)
    );

    try {
      const response = await apiClient.post(
        "/admin/v1/categories/reorder",
        payload
      );

      console.log(
        "[categoryService] Reorder Response:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error("Status:", error?.response?.status);
      console.error("Response Data:", error?.response?.data);
      console.error(
        "Validation Issues:",
        JSON.stringify(
          error?.response?.data?.error?.details?.issues,
          null,
          2
        )
      );

      console.error(
        "Payload Sent:",
        JSON.stringify(payload, null, 2)
      );

      throw error;
    }
  },

  getCategoryProducts: async (categoryId: string, params?: { limit?: number; cursor?: string }): Promise<any> => {
    const { data } = await apiClient.get(
      `/admin/v1/categories/${categoryId}/products`,
      { params }
    );
    return data;
  },

  reorderCategoryProduct: async (
    categoryId: string,
    productId: string,
    payload: { prevSortOrder: number | null; nextSortOrder: number | null }
  ): Promise<any> => {
    const { data } = await apiClient.put(
      `/admin/v1/categories/${categoryId}/products/${productId}/sort`,
      payload
    );
    return data;
  },
};