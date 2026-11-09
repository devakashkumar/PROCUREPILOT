import { createApp } from "./app.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { Product } from "./models/Product.js";
import { runSeed } from "./seed/seed.js";
import { Server } from "node:http";

let server: Server | null = null;

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDb();

    // Auto-seed if running on fresh in-memory or empty database
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      logger.info("Empty database detected. Auto-seeding initial catalog and demo account...");
      await runSeed(false);
    }

    // Create Express app
    const app = createApp();

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 ProcurePilot API server listening on port ${env.PORT} (${env.NODE_ENV})`
      );
      logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start server");
    process.exit(1);
  }
}

// Graceful shutdown handling
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }
  try {
    await disconnectDb();
    logger.info("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Error during database disconnection");
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap();
