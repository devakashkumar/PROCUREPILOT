import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { ERROR_CODES } from "../config/constants.js";
import { sendError } from "../utils/response.js";

const rateLimitHandler = (_req: Request, res: Response): void => {
  sendError(
    res,
    ERROR_CODES.RATE_LIMITED,
    "Too many requests, please slow down and try again later.",
    429
  );
};

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req: Request) => {
    // If authenticated, rate limit per user, else per IP
    return (req as unknown as { user?: { id?: string } }).user?.id || req.ip || "unknown";
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
