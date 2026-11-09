import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

export const capturePaymentSchema = z.object({
  paypalOrderId: z.string().min(1, "paypalOrderId is required"),
});

export const cancelPaymentSchema = z.object({
  paypalOrderId: z.string().min(1, "paypalOrderId is required"),
});
