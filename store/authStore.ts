import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/services";
import { setToken, setTokenExpiry, removeAll, getToken } from "@/utils/auth";
import toast from "react-hot-toast";

const getErrorMessage = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  if (data) {
    if (typeof data === "string") {
      return data.length < 150 ? data : fallback;
    }
    const rawMsg = data.message || data.error || data.errorMessage;
    if (Array.isArray(rawMsg)) {
      return rawMsg.join(", ");
    }
    if (typeof rawMsg === "string") {
      return rawMsg;
    }
    if (rawMsg && typeof rawMsg === "object") {
      if (typeof (rawMsg as any).message === "string") {
        return (rawMsg as any).message;
      }
      if (typeof (rawMsg as any).error === "string") {
        return (rawMsg as any).error;
      }
    }
  }
  return err?.response?.data?.message || err?.message || fallback;
};

export interface User {
  id: string;
  type: string;
  phone: string;
  email: string;
  name?: string;
  status: string;
  preferredLocale: string;
  createdAt: string;
  roles: string[];
  permissions: Record<string,
    { create: boolean; read: boolean; update: boolean; delete: boolean }
  >;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  setHasHydrated: (val: boolean) => void;
  setTokens: (data: {
    accessToken: string;
    refreshToken: string;
    accessExpiresInSec: number;
  }) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  isAccessTokenExpiringSoon: () => boolean;
  checkAuth: () => Promise<void>;
  forgotPasswordOtp: (email: string) => Promise<void>;
  forgotPasswordReset: (email: string, otpCode: string, newPassword: string) => Promise<void>;
  requestPhoneOtp: (phone: string, purpose: string) => Promise<void>;
  resetPassword: (
    phone: string,
    purpose: string,
    otpCode: string,
    oldPassword?: string,
    newPassword?: string
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      setHasHydrated: (val) => set({ hasHydrated: val }),

      // ─── setTokens — called after login + after refresh ────
      setTokens: ({ accessToken, refreshToken, accessExpiresInSec }) => {
        setToken("access_token", accessToken);
        if (refreshToken) setToken("refresh_token", refreshToken);
        if (accessExpiresInSec) setTokenExpiry(accessExpiresInSec);

        set({
          accessToken,
          refreshToken,
          accessTokenExpiresAt: Date.now() + accessExpiresInSec * 1000,
          isAuthenticated: true,
        });
      },

      // ─── Login ─────────────────────────────────────────────
      login: async (email, password) => {
        console.log(`[authStore] login: Initiating for ${email}`);
        set({ isLoading: true, error: null });
        try {
          const json = await authService.login(email, password);
          const { accessToken, refreshToken, accessExpiresInSec, user } = json.data;
          console.log(`[authStore] login: Success. User ID = ${user.id}`);

          setToken("access_token", accessToken);
          setToken("refresh_token", refreshToken);
          setTokenExpiry(accessExpiresInSec);

          const normalizedUser = user ? {
            ...user,
            roles: Array.isArray(user.roles)
              ? user.roles.map((r: any) => (r && typeof r === "object" ? (r.name || r.id || "") : String(r)))
              : []
          } : null;

          set({
            accessToken,
            refreshToken,
            accessTokenExpiresAt: Date.now() + accessExpiresInSec * 1000,
            user: normalizedUser,
            isAuthenticated: true,
            error: null,
          });
        } catch (err: any) {
          const message = getErrorMessage(err, "Login failed. Please try again.");
          console.error(`[authStore] login: Error:`, err);
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      // ─── Logout ────────────────────────────────────────────
      logout: () => {
        const { isAuthenticated } = get();
        console.log("[authStore] logout: Clearing credentials.");
        if (isAuthenticated || getToken("refresh_token")) {
          authService.logout();
        }
        removeAll();
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // ─── isAccessTokenExpiringSoon ─────────────────────────
      isAccessTokenExpiringSoon: () => {
        const { accessToken, accessTokenExpiresAt } = get();
        if (!accessToken || !accessTokenExpiresAt) return true;
        return Date.now() >= accessTokenExpiresAt - 2 * 60 * 1000; // 2 min buffer
      },

      // ─── checkAuth — runs on load + every 60s + tab focus ──
      checkAuth: async () => {
        console.log(`[authStore] checkAuth: Verifying auth state...`);
        const { refreshToken, isAccessTokenExpiringSoon, setTokens, logout, isAuthenticated } = get();

        if (!isAuthenticated && !refreshToken) {
          console.log(`[authStore] checkAuth: Already unauthenticated, skipping check.`);
          return;
        }

        if (!refreshToken) {
          console.log(`[authStore] checkAuth: No refresh token. Logging out.`);
          logout();
          return;
        }

        if (isAccessTokenExpiringSoon()) {
          console.log(`[authStore] checkAuth: Token expiring soon. Refreshing...`);
          try {
            const json = await authService.refresh(refreshToken);
            console.log(`[authStore] checkAuth: Refresh successful.`);
            setTokens(json.data);
          } catch (err: any) {
            console.error(`[authStore] checkAuth: Refresh failed. Logging out.`, err);
            const status = err?.response?.status;
            if ([401, 403, 500].includes(status)) {
              toast.error("Session expired, please login again");
            } else {
              toast.error("Connection issue, please try again");
            }
            logout();
          }
        } else {
          console.log(`[authStore] checkAuth: Token still valid.`);
        }
      },

      // ─── Forgot Password ───────────────────────────────────
      forgotPasswordOtp: async (email) => {
        console.log(`[authStore] forgotPasswordOtp: Sending OTP to ${email}`);
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPasswordOtp(email);
        } catch (err: any) {
          const message = getErrorMessage(err, "Failed to send OTP. Please try again.");
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      forgotPasswordReset: async (email, otpCode, newPassword) => {
        console.log(`[authStore] forgotPasswordReset: Resetting for ${email}`);
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPasswordReset(email, otpCode, newPassword);
        } catch (err: any) {
          const message = getErrorMessage(err, "Failed to reset password. Please try again.");
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      // ─── Phone OTP ─────────────────────────────────────────
      requestPhoneOtp: async (phone, purpose) => {
        console.log(`[authStore] requestPhoneOtp: Requesting for ${phone}`);
        set({ isLoading: true, error: null });
        try {
          await authService.requestPhoneOtp(phone, purpose);
        } catch (err: any) {
          const message = getErrorMessage(err, "Failed to request verification code. Please try again.");
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (phone, purpose, otpCode, oldPassword, newPassword) => {
        console.log(`[authStore] resetPassword: Resetting for ${phone}`);
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(phone, purpose, otpCode, oldPassword, newPassword);
        } catch (err: any) {
          const message = getErrorMessage(err, "Failed to reset password. Please try again.");
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => {
        const normalizedUser = user ? {
          ...user,
          roles: Array.isArray(user.roles)
            ? user.roles.map((r: any) => (r && typeof r === "object" ? (r.name || r.id || "") : String(r)))
            : []
        } : null;
        set({ user: normalizedUser });
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // ✅ persisted to localStorage
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // ❌ accessToken NOT persisted — silently refreshed on every page load
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = getToken("access_token");
          if (token) {
            state.accessToken = token;
          }
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

// ─── Side effects ─────────────────────────────────────────────
if (typeof window !== "undefined") {
  if (!(window as any).__authStoreInitialized) {
    (window as any).__authStoreInitialized = true;

    // check every 60s
    setInterval(() => {
      useAuthStore.getState().checkAuth();
    }, 60_000);

    // refresh when user comes back to tab
    window.addEventListener("focus", () => {
      useAuthStore.getState().checkAuth();
    });
  }
}