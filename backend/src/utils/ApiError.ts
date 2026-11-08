import { ErrorCode, ERROR_CODES } from "../config/constants.js";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code: ErrorCode = ERROR_CODES.VALIDATION_ERROR, details?: unknown) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = "Authentication required", code: ErrorCode = ERROR_CODES.UNAUTHORIZED) {
    return new ApiError(401, code, message);
  }

  static forbidden(message = "Access forbidden", code: ErrorCode = ERROR_CODES.FORBIDDEN) {
    return new ApiError(403, code, message);
  }

  static notFound(message = "Resource not found", code: ErrorCode = ERROR_CODES.NOT_FOUND) {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code: ErrorCode = ERROR_CODES.CONFLICT, details?: unknown) {
    return new ApiError(409, code, message, details);
  }

  static invalidState(message: string, details?: unknown) {
    return new ApiError(400, ERROR_CODES.INVALID_STATE, message, details);
  }

  static budgetExceeded(message: string, details?: unknown) {
    return new ApiError(400, ERROR_CODES.BUDGET_EXCEEDED, message, details);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, ERROR_CODES.INTERNAL_ERROR, message);
  }
}
