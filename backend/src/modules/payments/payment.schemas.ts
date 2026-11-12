import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
  forceNew: z.boolean().optional(),
});

export const capturePaymentSchema = z.object({
  paypalOrderId: z.string().min(1, "paypalOrderId is required"),
  sandboxSimulated: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional(),
});

export const cancelPaymentSchema = z.object({
  paypalOrderId: z.string().min(1, "paypalOrderId is required"),
});
