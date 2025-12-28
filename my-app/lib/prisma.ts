// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances of PrismaClient in dev
  // (Next.js hot-reloads can cause "Too many connections" error)
  // We extend the global object with a prisma property
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
