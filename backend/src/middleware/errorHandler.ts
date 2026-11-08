import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ERROR_CODES } from "../config/constants.js";
import { sendError } from "../utils/response.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // If headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return;
  }

  // Handle custom ApiError
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method }, "Server ApiError occurred");
    } else {
      logger.warn({ err: err.message, code: err.code, path: req.path }, "Client ApiError");
    }
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Mongoose duplicate key error (code 11000)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((err as any).code === 11000) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keys = Object.keys((err as any).keyPattern || {});
    const field = keys.length ? keys.join(", ") : "resource";
    sendError(
      res,
      ERROR_CODES.CONFLICT,
      `A duplicate value was detected for ${field}.`,
      409,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).keyValue
    );
    return;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const castErr = err as any;
    sendError(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      `Invalid format for parameter: ${castErr.path}`,
      400,
      { path: castErr.path, value: castErr.value }
    );
    return;
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valErr = err as any;
    const details = Object.keys(valErr.errors || {}).map((key) => ({
      field: key,
      message: valErr.errors[key].message,
    }));
    sendError(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      `Database validation failed: ${details.map((d) => d.message).join(", ")}`,
      400,
      details
    );
    return;
  }

  // Unexpected internal errors
  logger.error({ err, path: req.path, method: req.method }, "Unhandled server error");
  const message =
    env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message || "Internal server error";

  sendError(res, ERROR_CODES.INTERNAL_ERROR, message, 500);
}
