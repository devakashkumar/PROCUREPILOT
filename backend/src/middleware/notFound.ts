import { Request, Response } from "express";
import { ERROR_CODES } from "../config/constants.js";
import { sendError } from "../utils/response.js";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    ERROR_CODES.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
}
