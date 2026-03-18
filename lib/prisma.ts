import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prevent creating extra PrismaClient instances during development hot reloads.
// We attach the singleton to `globalThis` with a type-safe declaration.
declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];
const prisma =
  globalThis.prisma ?? new PrismaClient({ adapter } as PrismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export { prisma };

