import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { ERROR_CODES } from "../config/constants.js";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

const isDev = env.NODE_ENV !== "production";

const isLoopback = (ip?: string): boolean => {
  if (!ip) return false;
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.");
};

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
  max: isDev ? 5000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => isDev && isLoopback(req.ip),
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => isDev && isLoopback(req.ip),
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 100,
  keyGenerator: (req: Request) => {
    // If authenticated, rate limit per user, else per IP
    return (req as unknown as { user?: { id?: string } }).user?.id || req.ip || "unknown";
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => isDev && isLoopback(req.ip),
});
