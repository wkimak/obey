import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// In the current setup we call this from a protected layout, which means
// it can run on many requests. This throttle keeps DB writes reasonable
// while still being safe/idempotent for correctness.
const SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes per user per server process
const lastSyncedAtByClerkId = new Map<string, number>();

// Ensures every authenticated Clerk user has a corresponding row in Prisma's `User` table.
// This is a "lazy" sync: it runs on-demand when the user first accesses a protected page.
export async function ensureClerkUserInDb() {
  const user = await currentUser();
  if (!user) return; // `auth().protect()` should have already blocked unauthenticated requests.

  const clerkId = user.id;
  const email = user.primaryEmailAddress?.emailAddress ?? null;

  const now = Date.now();
  const lastSyncedAt = lastSyncedAtByClerkId.get(clerkId);
  if (lastSyncedAt && now - lastSyncedAt < SYNC_THROTTLE_MS) {
    return; // avoid repeated upserts on every request
  }

  await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
    },
    create: {
      clerkId,
      email: email ?? undefined,
    },
  });

  lastSyncedAtByClerkId.set(clerkId, now);
}

