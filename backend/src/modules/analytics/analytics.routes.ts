import { Router } from "express";
import { AnalyticsController } from "./analytics.controller.js";
import { authMiddleware } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

analyticsRouter.get("/summary", asyncHandler(AnalyticsController.getSummary));
