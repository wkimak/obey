-- This migration makes `User.id` equal to Clerk's `userId` (clerkId).
-- Steps:
-- 1) Backfill: update User.id = User.clerkId (FKs update due to ON UPDATE CASCADE)
-- 2) Remove the now-redundant clerkId column and its unique index

ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;

UPDATE "User"
SET "id" = "clerkId";

ALTER TABLE "User" DROP COLUMN "clerkId";

