import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// URL padrão segura para PostgreSQL no Docker ou local
const fallbackDbUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "postgresql://loopx:loopx_password@postgres:5432/loopx_db?schema=public"
    : "postgresql://loopx:loopx_password@localhost:5432/loopx_db?schema=public");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: fallbackDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
