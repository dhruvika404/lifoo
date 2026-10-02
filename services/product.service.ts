import { apiClient } from "./api";

export interface Product {
  id: string;
  chefId: string;
  categoryId?: string;
  chefDisplayName?: string;
  chefBusinessName?: string;
  chefPhone?: string;
  name: string;
  slug?: string;
  description: string | null;
  price?: number;
  basePricePaisa?: number;
  status: string; // active, inactive, draft, pending, rejected
  preparationTimeMinutes: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsListResponse {
  ok: boolean;
  data: {
    items: Product[];
    nextCursor?: string | null;
    total?: number;
    totalProducts?: number;
    statusCounts?: Record<string, number>;
  };
}

export interface GetProductResponse {
  ok: boolean;
  data: any;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string | null;
  basePricePaisa?: number;
  actualPricePaisa?: number | null;
  preparationTimeMinutes?: number;
  weight?: number | null;
  weightUnit?: string | null;
  shelfLifeHours?: number | null;
  ingredients?: string[];
  allergens?: string[];
  cuisineIds?: string[];
  dietaryTypeIds?: string[];
  imageUrl?: string | null;
  nutritions?: { nutritionId: string; value: number; unit: string }[];
}

export interface GetProductUploadUrlResponse {
  data: {
    productId: string;
    presignedUrl: string;
    s3Key: string;
  };
}

export const productService = {
  getProducts: async (params?: {
    limit?: number;
    cursor?: string;
    status?: string;
    search?: string;
    categoryId?: string;
  }): Promise<GetProductsListResponse> => {
    const { data } = await apiClient.get<GetProductsListResponse>(
      "/admin/v1/verifications/products",
      { params }
    );
    return data;
  },

  getProductById: async (id: string): Promise<GetProductResponse> => {
    const { data } = await apiClient.get<GetProductResponse>(`/admin/v1/products/${id}`);
    return data;
  },

  updateProductStatus: async (id: string, payload: { status: string }): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/products/${id}/status`, payload);
    return data;
  },

  updateProduct: async (id: string, payload: UpdateProductPayload): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/products/${id}`, payload);
    return data;
  },

  getProductUploadUrl: async (mimeType: string, productId?: string): Promise<GetProductUploadUrlResponse> => {
    let url = `/admin/v1/products/upload-url?mimeType=${encodeURIComponent(mimeType)}`;
    if (productId) url += `&productId=${productId}`;
    const { data } = await apiClient.get<GetProductUploadUrlResponse>(url);
    return data;
  },

  updateProductTags: async (id: string, tags: string[]): Promise<any> => {
    const { data } = await apiClient.put(`/admin/v1/products/${id}/tags`, { tags });
    return data;
  },

  updateProductKeywords: async (id: string, keywords: string[]): Promise<any> => {
    const { data } = await apiClient.put(`/admin/v1/products/${id}/keywords`, { keywords });
    return data;
  },

  deleteProduct: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete(`/admin/v1/products/${id}`);
    return data;
  },

  restoreProduct: async (id: string): Promise<any> => {
    const { data } = await apiClient.post(`/admin/v1/products/${id}/restore`, {});
    return data;
  },

  addProductImage: async (productId: string, payload: { source: string; b2Path: string; isLabelRequired: boolean; sortOrder: number }): Promise<any> => {
    const { data } = await apiClient.post(`/admin/v1/products/${productId}/images`, payload);
    return data;
  },

  deleteProductImage: async (imageId: string): Promise<any> => {
    const { data } = await apiClient.delete(`/admin/v1/products/images/${imageId}`);
    return data;
  },

  reorderProductImages: async (productId: string, imageIds: string[]): Promise<any> => {
    const { data } = await apiClient.patch(`/admin/v1/products/${productId}/images/reorder`, { imageIds });
    return data;
  },
};
