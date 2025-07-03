import { PrismaClient } from "@prisma/client";

// Import environment variables in a type-safe way
// You might need to set up an `env.mjs` file as recommended by T3 docs
const env = {
  NODE_ENV: process.env.NODE_ENV,
};

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;