import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { authRateLimiter } from "../../middleware/rateLimiters.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(AuthController.register)
);

authRouter.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(AuthController.login)
);

authRouter.get(
  "/me",
  authMiddleware,
  asyncHandler(AuthController.me)
);

authRouter.post(
  "/refresh",
  validate({ body: refreshSchema }),
  asyncHandler(AuthController.refresh)
);

authRouter.post(
  "/logout",
  authMiddleware,
  asyncHandler(AuthController.logout)
);
