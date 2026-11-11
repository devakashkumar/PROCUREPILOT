import { apiClient } from "../lib/api.js";
import { User, Business } from "../types/api.js";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
  city: string;
  gstin?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  gstin?: string;
  monthlyBudgetPaise?: number;
  preferences?: {
    priority?: "cheapest" | "reliable" | "balanced" | "fastest";
    minReliability?: number;
  };
}

export interface AuthResponseData {
  user: User;
  business: Business;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<unknown, AuthResponseData>("/auth/register", payload),

  login: (payload: LoginPayload) =>
    apiClient.post<unknown, AuthResponseData>("/auth/login", payload),

  getMe: () =>
    apiClient.get<unknown, { user: User; business: Business }>("/auth/me"),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<unknown, { user: User; business: Business }>("/auth/profile", payload),

  logout: () => apiClient.post<unknown, { message: string }>("/auth/logout"),
};
