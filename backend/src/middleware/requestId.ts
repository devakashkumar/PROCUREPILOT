import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header("x-request-id") || req.header("X-Request-Id");
  const requestId = incomingId && typeof incomingId === "string" ? incomingId : uuidv4();

  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
}
