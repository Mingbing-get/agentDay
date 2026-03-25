import { PrismaClient } from "@prisma/client";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var __agentDayPrisma__: PrismaClient | undefined;
}

function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL ?? "file:./dev.db";

  if (configured.startsWith("file:./")) {
    const relativePath = configured.slice("file:./".length);
    const absolutePath = resolve(process.cwd(), "prisma", relativePath);
    return `file:${absolutePath}`;
  }

  return configured;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalThis.__agentDayPrisma__ ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__agentDayPrisma__ = prisma;
}

export async function ensureDatabaseSchema() {
  if (!databaseUrl.startsWith("file:")) {
    return;
  }

  const filePath = databaseUrl.slice("file:".length);
  await mkdir(dirname(filePath), { recursive: true });

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "summary" TEXT NOT NULL,
      "theme" TEXT NOT NULL,
      "archetype" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "heroImage" TEXT,
      "artifactPresence" TEXT NOT NULL,
      "publishedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Project_date_key" ON "Project"("date")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug")`
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GenerationRun" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "startedAt" DATETIME NOT NULL,
      "finishedAt" DATETIME,
      "errorSummary" TEXT,
      CONSTRAINT "GenerationRun_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "GenerationRun_projectId_startedAt_idx" ON "GenerationRun"("projectId", "startedAt")`
  );
}
