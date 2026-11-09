import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api.js";
import { AnalyticsSummary } from "../types/api.js";

export const analyticsApi = {
  getSummary: () => apiClient.get<unknown, AnalyticsSummary>("/analytics/summary"),
};

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsApi.getSummary(),
  });
}
