import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api.js";
import {
  ProcurementRequest,
  ProcurementRequirements,
  ItemMatchResult,
  OptimizedPlan,
  AlternativePlan,
  ProcurementStrategy,
} from "../types/api.js";

export interface AnalyzeResponse {
  requestId: string;
  requirements: ProcurementRequirements;
  aiModel?: string;
  usedFallback: boolean;
}

export interface SearchResponse {
  requestId: string;
  matches: ItemMatchResult[];
  unmatched: Array<{ item: unknown; suggestions: Array<{ id: string; name: string; score: number }> }>;
}

export interface OptimizeResponse {
  requestId: string;
  strategy: ProcurementStrategy;
  plan: OptimizedPlan;
  alternatives: AlternativePlan[];
  explanation: string;
  warnings: string[];
}

export const procurementApi = {
  analyze: (message: string) =>
    apiClient.post<unknown, AnalyzeResponse>("/procurement/analyze", { message }),

  search: (payload: {
    requestId: string;
    requirements?: ProcurementRequirements;
    overrideProductIds?: Record<string, string>;
  }) => apiClient.post<unknown, SearchResponse>("/procurement/search", payload),

  optimize: (payload: {
    requestId: string;
    strategy?: ProcurementStrategy;
    overrides?: {
      budgetPaise?: number;
      selectedProductIds?: Record<string, string>;
      excludedSuppliers?: string[];
      preferredSuppliers?: string[];
    };
  }) => apiClient.post<unknown, OptimizeResponse>("/procurement/optimize", payload),

  getRequests: (params?: { page?: number; limit?: number }) =>
    apiClient.get<
      unknown,
      {
        requests: ProcurementRequest[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }
    >("/procurement/requests", { params }),

  getRequest: (id: string) =>
    apiClient.get<unknown, ProcurementRequest>(`/procurement/requests/${id}`),
};

export function useProcurementRequests(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["procurement-requests", params],
    queryFn: () => procurementApi.getRequests(params),
  });
}

export function useProcurementRequest(id: string) {
  return useQuery({
    queryKey: ["procurement-request", id],
    queryFn: () => procurementApi.getRequest(id),
    enabled: Boolean(id),
  });
}
