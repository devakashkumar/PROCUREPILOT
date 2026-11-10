import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api.js";
import { PurchaseOrder, Payment, ProcurementStrategy, OrderStatus } from "../types/api.js";

export interface OrdersListResponse {
  orders: PurchaseOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersApi = {
  create: (payload: { requestId: string; strategy?: ProcurementStrategy; notes?: string }) =>
    apiClient.post<unknown, { order: PurchaseOrder; warnings: string[] }>("/orders", payload),

  list: (params?: { page?: number; limit?: number; status?: OrderStatus; search?: string }) =>
    apiClient.get<unknown, OrdersListResponse>("/orders", { params }),

  getById: (id: string) =>
    apiClient.get<unknown, { order: PurchaseOrder; payment: Payment | null }>(`/orders/${id}`),

  approve: (id: string) =>
    apiClient.post<unknown, { order: PurchaseOrder }>(`/orders/${id}/approve`),

  reject: (id: string, reason: string) =>
    apiClient.post<unknown, { order: PurchaseOrder }>(`/orders/${id}/reject`, { reason }),

  cancel: (id: string) =>
    apiClient.post<unknown, { order: PurchaseOrder }>(`/orders/${id}/cancel`),
};

export function useOrders(params?: { page?: number; limit?: number; status?: OrderStatus; search?: string }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id),
    enabled: Boolean(id),
  });
}
