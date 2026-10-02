// utils/auth.ts
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";

interface RefreshTokenResponse {
  ok: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    accessExpiresInSec: number;
  };
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const TOKEN_REFRESH_THRESHOLD = 2; // minutes before expiry to refresh (13th min of 15)
let isRefreshing = false;

// ─── Getters / Setters ────────────────────────────────────────

export const getToken = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const setToken = (name: string, value: string): void => {
  Cookies.remove(name, { path: "/" });
  Cookies.set(name, value, {
    path: "/",
    sameSite: "strict",
    secure: window.location.protocol === "https:",
  });
};

export const setTokenExpiry = (expiresInSec: number): void => {
  const expiresAt = Date.now() + expiresInSec * 1000;
  Cookies.set("access_token_expiry", String(expiresAt), {
    path: "/",
    sameSite: "strict",
    secure: window.location.protocol === "https:",
  });
};

export const removeToken = (name: string): void => {
  Cookies.remove(name, { path: "/" });
};

export const removeAll = (): void => {
  Cookies.remove("access_token", { path: "/" });
  Cookies.remove("refresh_token", { path: "/" });
  Cookies.remove("access_token_expiry", { path: "/" });
  localStorage.removeItem("user");
  isRefreshing = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("updateStorage"));
  }
};

// ─── Token Refresh ────────────────────────────────────────────

const refreshToken = async (refreshTokenValue: string): Promise<void> => {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const { data } = await axios.post<RefreshTokenResponse>(
      `${API_URL}/api/v1/auth/token/refresh`,
      { refreshToken: refreshTokenValue },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Tunnel-Skip-AntiPhishing-Page": "true",
          "ngrok-skip-browser-warning": "true",
          ...(getToken("access_token") && {
            Authorization: `Bearer ${getToken("access_token")}`,
          }),
        },
      }
    );

    if (data?.data?.accessToken) {
      setToken("access_token", data.data.accessToken);

      if (data?.data?.refreshToken) {
        setToken("refresh_token", data.data.refreshToken);
      }

      if (data?.data?.accessExpiresInSec) {
        setTokenExpiry(data.data.accessExpiresInSec);
      }

      window.dispatchEvent(new Event("updateStorage"));
    } else {
      throw new Error("Invalid refresh response");
    }
  } catch (err) {
    if (
      axios.isAxiosError(err) &&
      [401, 403, 500].includes(err?.response?.status ?? 0)
    ) {
      toast.error("Session expired, please login again");
      removeAll();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else {
      toast.error("Connection issue, please try again");
    }
  } finally {
    isRefreshing = false;
  }
};

// ─── checkToken — called by store interval + checkAuth ────────

export const checkToken = async (): Promise<void> => {
  const refreshTokenValue = getToken("refresh_token");
  const accessToken = getToken("access_token");
  const expiryStr = Cookies.get("access_token_expiry");

  // no refresh token = fully logged out, clear everything
  if (!refreshTokenValue) {
    removeAll();
    return;
  }

  if (accessToken && expiryStr) {
    const msRemaining = Number(expiryStr) - Date.now();
    const minutesRemaining = Math.floor(msRemaining / 1000 / 60);

    if (minutesRemaining <= 0) {
      // access token fully expired, try silent refresh
      console.warn("Access token expired, attempting silent refresh");
      removeToken("access_token");
      removeToken("access_token_expiry");
      await refreshToken(refreshTokenValue);
      return;
    }

    if (minutesRemaining <= TOKEN_REFRESH_THRESHOLD && !isRefreshing) {
      // within 2 min of expiry → proactive refresh
      await refreshToken(refreshTokenValue);
    }
  } else {
    // no access token or expiry cookie but refresh token exists → silent refresh
    if (!isRefreshing) {
      await refreshToken(refreshTokenValue);
    }
  }
};