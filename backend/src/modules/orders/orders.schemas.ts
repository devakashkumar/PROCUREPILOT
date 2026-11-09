import { z } from "zod";
import { ORDER_STATUS } from "../../config/constants.js";

export const createOrderSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  strategy: z.enum(["cheapest", "reliable", "balanced", "fastest"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS) as [string, ...string[]]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const rejectOrderSchema = z.object({
  reason: z.string().min(2, "Reason must be at least 2 characters").max(500),
});
