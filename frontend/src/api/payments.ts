import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api.js";
import { Payment } from "../types/api.js";

export interface CreatePaymentResponse {
  paymentId: string;
  paypalOrderId: string;
  amountUsd: number;
  amountInr: number;
  fxRate: number;
  fxNote: string;
  approveUrl?: string | null;
}

export interface CapturePaymentResponse {
  paymentId: string;
  status: string;
  captureId?: string;
  capturedAt?: string;
  orderStatus?: string;
  alreadyProcessed?: boolean;
}

export const paymentsApi = {
  create: (orderId: string) =>
    apiClient.post<unknown, CreatePaymentResponse>("/payments/create", { orderId }),

  capture: (paypalOrderId: string, sandboxSimulated?: boolean) =>
    apiClient.post<unknown, CapturePaymentResponse>("/payments/capture", { paypalOrderId, sandboxSimulated }),

  cancel: (paypalOrderId: string) =>
    apiClient.post<unknown, { payment: Payment }>("/payments/cancel", { paypalOrderId }),

  getById: (id: string) => apiClient.get<unknown, Payment>(`/payments/${id}`),
};

export function usePayment(id: string, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentsApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}
