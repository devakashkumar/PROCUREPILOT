import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";
import { logger } from "./logger.js";

let mongod: MongoMemoryServer | null = null;

export async function connectDb(): Promise<string> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host;
  }

  let uri = env.MONGODB_URI;

  if (!uri) {
    if (env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI must be provided in production");
    }
    logger.info("No MONGODB_URI provided. Starting in-memory MongoDB server...");
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`Connected to MongoDB successfully (${uri.startsWith("mongodb://127.0.0.1") || uri.includes("inmemory") ? "In-Memory/Local" : "Remote"})`);
    return uri;
  } catch (error) {
    logger.warn({ error }, "Failed to connect to provided MONGODB_URI. Attempting in-memory fallback...");
    if (env.NODE_ENV !== "production") {
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri);
      logger.info(`Fallback in-memory MongoDB connected at ${uri}`);
      return uri;
    }
    throw error;
  }
}

export async function disconnectDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Mongoose disconnected");
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
    logger.info("In-memory MongoDB stopped");
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
