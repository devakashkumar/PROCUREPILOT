import { Response } from "express";
import { ErrorCode, ERROR_CODES } from "../config/constants.js";

export interface ResponseMeta {
  requestId?: string;
  [key: string]: unknown;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  meta: ResponseMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  extraMeta: Record<string, unknown> = {}
): Response {
  const requestId = (res.locals.requestId as string) || (res.getHeader("x-request-id") as string) || "";
  const payload: SuccessEnvelope<T> = {
    success: true,
    data,
    meta: {
      requestId,
      ...extraMeta,
    },
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
  message: string,
  statusCode = 500,
  details?: unknown,
  extraMeta: Record<string, unknown> = {}
): Response {
  const requestId = (res.locals.requestId as string) || (res.getHeader("x-request-id") as string) || "";
  const payload: ErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      requestId,
      ...extraMeta,
    },
  };
  return res.status(statusCode).json(payload);
}
