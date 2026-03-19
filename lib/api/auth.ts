import { auth } from "@clerk/nextjs/server";
import { ensureClerkUserInDb } from "@/lib/ensure-clerk-user";

export async function requireUserId() {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) return null;

  // After the schema update, `User.id` is the Clerk user id.
  await ensureClerkUserInDb();
  return userId;
}

