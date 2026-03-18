import { auth } from "@clerk/nextjs/server";

export async function requireUserId() {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) return null;
  return userId;
}

