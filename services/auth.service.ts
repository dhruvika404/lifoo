import { apiClient } from "./api";
import type { User } from "@/store/authStore";

interface LoginResponse {
  ok: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    accessExpiresInSec: number;
    user: User;
  };
}

interface RefreshResponse {
  ok: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    accessExpiresInSec: number;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/api/v1/auth/login", {
      email,
      password,
    });
    return data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await apiClient.post<RefreshResponse>(
      "/api/v1/auth/token/refresh",
      { refreshToken }
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/v1/auth/logout").catch(() => { });
  },

  forgotPasswordOtp: async (email: string): Promise<any> => {
    const { data } = await apiClient.post("/api/v1/auth/password/forgot/otp", { email });
    return data;
  },

  forgotPasswordReset: async (email: string, otpCode: string, newPassword: string): Promise<any> => {
    const { data } = await apiClient.post("/api/v1/auth/password/forgot/reset", {
      email,
      otpCode,
      newPassword,
    });
    return data;
  },

  requestPhoneOtp: async (phone: string, purpose: string): Promise<any> => {
    const { data } = await apiClient.post("/api/v1/auth/otp/request", {
      phone,
      purpose,
    });
    return data;
  },

  resetPassword: async (
    phone: string,
    purpose: string,
    otpCode: string,
    oldPassword?: string,
    newPassword?: string
  ): Promise<any> => {
    const { data } = await apiClient.post("/api/v1/auth/password/reset", {
      phone,
      purpose,
      otpCode,
      oldPassword,
      newPassword,
    });
    return data;
  },
};