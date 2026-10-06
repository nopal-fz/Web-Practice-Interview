import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// libSQL speaks the SQLite dialect, so one DATABASE_URL covers both worlds:
// file:./dev.db for local work, libsql://… for production. Vercel's filesystem is
// read-only apart from /tmp and instances share nothing, so a local .db file is
// not a deploy target (vercel.com/kb/guide/is-sqlite-supported-in-vercel).
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}