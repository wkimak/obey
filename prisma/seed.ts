import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];
const prisma = new PrismaClient({ adapter } as PrismaClientOptions);

const GLOBAL_RULES = [
  {
    title: "Max Daily Loss",
    key: null,
    description: "The maximum daily loss allowed for the strategy.",
  },
  {
    title: "Max Loss on Trade",
    key: null,
    description: "The maximum loss allowed on a single trade.",
  },
  {
    title: "Max Consecutive Losses",
    key: null,
    description: "The maximum number of consecutive losses allowed for the strategy.",
  },
  {
    title: "Allowed Trading Hours",
    key: "optional-key",
    description: "The allowed trading hours for the strategy.",
  },
] as const;

function ruleDedupKey(title: string, key: string | null | undefined) {
  return `${title}::${key ?? ""}`;
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) {
    console.log("[seed] No users found; nothing to seed.");
    return;
  }

  console.log(`[seed] Seeding ${GLOBAL_RULES.length} global rules for ${users.length} users...`);

  for (const user of users) {
    const existing = await prisma.rule.findMany({
      where: { userId: user.id, scope: "GLOBAL", strategyId: null },
      select: { title: true, key: true },
    });

    const existingKeys = new Set(
      existing.map((r) => ruleDedupKey(r.title, r.key)),
    );

    const toCreate = GLOBAL_RULES.filter((r) => {
      return !existingKeys.has(ruleDedupKey(r.title, r.key));
    });

    if (toCreate.length === 0) continue;

    await prisma.rule.createMany({
      data: toCreate.map((r) => ({
        userId: user.id,
        scope: "GLOBAL",
        strategyId: null,
        title: r.title,
        key: r.key,
        description: r.description ?? null,
      })),
    });
  }

  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error("[seed] Failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

