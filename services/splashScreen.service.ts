import { apiClient } from "./api";

export type TargetPlatform = "ALL" | "ANDROID" | "IOS";
export type TargetAudience = "ALL" | "CUSTOMER" | "CHEF";

export interface SplashScreen {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  darkImageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  targetPlatform: TargetPlatform;
  targetAudience: TargetAudience;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetSplashScreensParams {
  limit?: number;
  cursor?: string;
  search?: string;
  isActive?: boolean;
  targetPlatform?: TargetPlatform | string;
  targetAudience?: TargetAudience | string;
}

export interface GetSplashScreensResponse {
  ok: boolean;
  data: {
    items: SplashScreen[];
    nextCursor?: string | null;
  };
}

export interface SplashScreenResponse {
  ok: boolean;
  data: SplashScreen;
}

export interface CreateSplashScreenPayload {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  darkImageUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  targetPlatform: TargetPlatform;
  targetAudience: TargetAudience;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export interface UpdateSplashScreenPayload {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string;
  darkImageUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  targetPlatform?: TargetPlatform;
  targetAudience?: TargetAudience;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

export interface ReorderSplashScreensPayload {
  items: ReorderItem[];
}

export interface GetUploadUrlResponse {
  ok: boolean;
  data: {
    presignedUrl: string;
    s3Key: string;
  };
}

export const splashScreenService = {
  // Fetch splash screens list with pagination and filters
  getSplashScreens: async (params?: GetSplashScreensParams): Promise<GetSplashScreensResponse> => {
    const { data } = await apiClient.get<GetSplashScreensResponse>("/admin/v1/splash-screens", {
      params,
    });
    return data;
  },

  // Fetch single splash screen by ID
  getSplashScreen: async (id: string): Promise<SplashScreenResponse> => {
    const { data } = await apiClient.get<SplashScreenResponse>(`/admin/v1/splash-screens/${id}`);
    return data;
  },

  // Get presigned URL for image upload
  getUploadUrl: async (mimeType: string): Promise<GetUploadUrlResponse> => {
    const { data } = await apiClient.get<GetUploadUrlResponse>(
      `/admin/v1/splash-screens/upload-url?mimeType=${encodeURIComponent(mimeType)}`
    );
    return data;
  },

  // Direct S3 upload helper using presigned URL
  uploadImageToS3: async (presignedUrl: string, file: File): Promise<void> => {
    const res = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    if (!res.ok) {
      throw new Error(`Failed to upload image to S3 (status ${res.status})`);
    }
  },

  // Create new splash screen
  createSplashScreen: async (payload: CreateSplashScreenPayload): Promise<SplashScreenResponse> => {
    const { data } = await apiClient.post<SplashScreenResponse>("/admin/v1/splash-screens", payload);
    return data;
  },

  // Edit / Update existing splash screen
  updateSplashScreen: async (
    id: string,
    payload: UpdateSplashScreenPayload
  ): Promise<SplashScreenResponse> => {
    const { data } = await apiClient.put<SplashScreenResponse>(
      `/admin/v1/splash-screens/${id}`,
      payload
    );
    return data;
  },

  // Reorder splash screens
  reorderSplashScreens: async (
    payload: ReorderSplashScreensPayload
  ): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.put<{ ok: boolean }>(
      "/admin/v1/splash-screens/reorder",
      payload
    );
    return data;
  },

  // Delete splash screen by ID
  deleteSplashScreen: async (id: string): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.delete<{ ok: boolean }>(`/admin/v1/splash-screens/${id}`);
    return data;
  },
};
