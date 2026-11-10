import express, { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { isDbConnected } from "./config/db.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { globalRateLimiter } from "./middleware/rateLimiters.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { captureRawBody } from "./middleware/rawBody.js";
import { sendSuccess } from "./utils/response.js";

// Import modules
import { authRouter } from "./modules/auth/auth.routes.js";
import { productRouter } from "./modules/products/product.routes.js";
import { supplierRouter } from "./modules/suppliers/supplier.routes.js";
import { procurementRouter } from "./modules/procurement/procurement.routes.js";
import { orderRouter } from "./modules/orders/order.routes.js";
import { paymentRouter, webhookRouter } from "./modules/payments/payment.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";

export function createApp(): Express {
  const app = express();

  // Trust reverse proxy (e.g. Render, Nginx)
  app.set("trust proxy", 1);

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Structured HTTP logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => (res.locals.requestId as string) || "",
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      autoLogging: {
        ignore: (req) => req.url === "/api/health",
      },
    })
  );

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile apps, curl, Postman (no origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: false,
    })
  );

  // Gzip compression
  app.use(compression());

  // Mount raw body for PayPal webhook BEFORE express.json()
  app.use(
    "/api/payments/webhook",
    express.raw({
      type: "application/json",
      limit: "1mb",
      verify: captureRawBody,
    }),
    webhookRouter
  );

  // JSON Body Parser with 100kb limit
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  // Sanitize input against NoSQL injection ($ and . in root keys)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const sanitize = (obj: unknown): void => {
      if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj as Record<string, unknown>)) {
          if (key.startsWith("$") || key.includes(".")) {
            delete (obj as Record<string, unknown>)[key];
          } else {
            sanitize((obj as Record<string, unknown>)[key]);
          }
        }
      }
    };
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
  });

  // Global rate limiter
  app.use("/api", globalRateLimiter);

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      db: isDbConnected() ? "up" : "down",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Module Routes
  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/suppliers", supplierRouter);
  app.use("/api/procurement", procurementRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/analytics", analyticsRouter);

  // 404 Handler
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
