import axios from "axios";
import { getToken, removeAll, setToken, setTokenExpiry } from "@/utils/auth";
import toast from "react-hot-toast";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

let isRefreshing = false;
let refreshQueue: { resolve: (t: string) => void; reject: (e: Error) => void }[] = [];

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Tunnel-Skip-AntiPhishing-Page": "true",
    "ngrok-skip-browser-warning": "true",
  },
});

// ─── Request interceptor — attach access token ────────────────
apiClient.interceptors.request.use((config) => {
  const token = getToken("access_token");
  console.log(`[API Client Interceptor] Request: Method = ${config.method?.toUpperCase()}, URL = ${config.url}, Has Token = ${!!token}`);
  
  // Do not attach the Authorization header to public login/refresh routes
  const isPublicRoute = config.url?.includes("/auth/login") || config.url?.includes("/auth/token/refresh");
  
  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 + auto refresh ─────────
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Client Interceptor] Response Success: Status = ${response.status}, URL = ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    console.log(
      `[API Client Interceptor] Response Error: Status = ${error?.response?.status}, URL = ${originalRequest?.url}, isLoginRequest = ${isLoginRequest}, currentPath = ${
        typeof window !== "undefined" ? window.location.pathname : "N/A"
      }`
    );

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      if (isLoginRequest) {
        console.log(`[API Client Interceptor] 401 on login request. Skipping refresh/redirect and propagating error.`);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshTokenValue = getToken("refresh_token");
      if (!refreshTokenValue) {
        console.log(`[API Client Interceptor] No refresh token found. Cleaning session storage/cookies.`);
        removeAll();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          console.log(`[API Client Interceptor] Redirecting to /login from: ${window.location.pathname}`);
          window.location.href = "/login";
        } else {
          console.log(`[API Client Interceptor] User is already on /login page. Skipping redirect to prevent reload.`);
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log(`[API Client Interceptor] Token refresh is already in progress. Queueing request: ${originalRequest.url}`);
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              console.log(`[API Client Interceptor] Resubmitting queued request with new token: ${originalRequest.url}`);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      console.log(`[API Client Interceptor] Initiating silent token refresh...`);
      try {
        const { data } = await axios.post(
          `${API_URL}/api/v1/auth/token/refresh`,
          { refreshToken: refreshTokenValue },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Tunnel-Skip-AntiPhishing-Page": "true",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const { accessToken, refreshToken, accessExpiresInSec } = data.data;
        console.log(`[API Client Interceptor] Token refresh succeeded. Expiry in: ${accessExpiresInSec}s`);

        setToken("access_token", accessToken);
        if (refreshToken) setToken("refresh_token", refreshToken);
        if (accessExpiresInSec) setTokenExpiry(accessExpiresInSec);

        window.dispatchEvent(new Event("updateStorage"));

        console.log(`[API Client Interceptor] Resolving ${refreshQueue.length} queued requests.`);
        refreshQueue.forEach(({ resolve }) => resolve(accessToken));
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        console.error(`[API Client Interceptor] Silent token refresh failed:`, err);
        refreshQueue.forEach(({ reject }) => reject(err as Error));
        toast.error("Session expired, please login again");
        removeAll();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          console.log(`[API Client Interceptor] Redirecting to /login after refresh failure from: ${window.location.pathname}`);
          window.location.href = "/login";
        } else {
          console.log(`[API Client Interceptor] User is already on /login page. Skipping redirect after refresh failure.`);
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
        refreshQueue = [];
      }
    }

    return Promise.reject(error);
  }
);