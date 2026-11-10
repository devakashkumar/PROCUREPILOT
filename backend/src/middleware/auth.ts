import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { ERROR_CODES } from "../config/constants.js";
import { TokenPayload } from "../modules/auth/auth.service.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
      businessId?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Authorization token is missing or malformed"));
  }

  const token = authHeader.substring(7).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    req.businessId = decoded.businessId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Access token has expired"));
    }
    return next(new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Invalid access token"));
  }
}
