import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore.js";
import { ApiResponse, ApiErrorResponse } from "../types/api.js";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token & Request ID
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Generate random client request ID if not provided
  if (!config.headers["X-Request-Id"]) {
    config.headers["X-Request-Id"] = `req_${Math.random().toString(36).substring(2, 10)}`;
  }

  return config;
});

// Response Interceptor: Unwrap Data and Handle Refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    // If wrapped in success envelope, unwrap data
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      const envelope = response.data as ApiResponse<unknown>;
      return envelope.data as typeof response;
    }
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      const message = error.response?.data?.error?.message || error.message || "Authentication error";
      return Promise.reject(new Error(message));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(new Error("Session expired. Please log in again."));
      }

      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${baseURL}/auth/refresh`,
          { refreshToken }
        );

        const newTokens = refreshResponse.data.data;
        const currentUser = useAuthStore.getState().user;
        const currentBiz = useAuthStore.getState().business;

        if (currentUser && currentBiz) {
          useAuthStore.getState().setAuth(currentUser, currentBiz, newTokens.accessToken, newTokens.refreshToken);
        }

        processQueue(null);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(new Error("Session expired. Please log in again."));
      }
    }

    // Format human-friendly API error
    const serverMessage = error.response?.data?.error?.message;
    const finalMessage = serverMessage || error.message || "An unexpected network error occurred";
    return Promise.reject(new Error(finalMessage));
  }
);
