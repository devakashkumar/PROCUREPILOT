import { Router } from "express";
import { ProcurementController } from "./procurement.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { aiRateLimiter } from "../../middleware/rateLimiters.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  analyzeRequestSchema,
  searchRequestSchema,
  optimizeRequestSchema,
} from "./procurement.schemas.js";

export const procurementRouter = Router();

procurementRouter.use(authMiddleware);

procurementRouter.post(
  "/analyze",
  aiRateLimiter,
  validate({ body: analyzeRequestSchema }),
  asyncHandler(ProcurementController.analyze)
);

procurementRouter.post(
  "/search",
  validate({ body: searchRequestSchema }),
  asyncHandler(ProcurementController.search)
);

procurementRouter.post(
  "/optimize",
  validate({ body: optimizeRequestSchema }),
  asyncHandler(ProcurementController.optimize)
);

procurementRouter.get(
  "/requests",
  asyncHandler(ProcurementController.list)
);

procurementRouter.get(
  "/requests/:id",
  asyncHandler(ProcurementController.getById)
);
