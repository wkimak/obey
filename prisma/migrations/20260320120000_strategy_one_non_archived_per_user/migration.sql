-- At most one non-archived strategy per user: archive duplicates (keep most recently updated).
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) AS rn
  FROM "Strategy"
  WHERE "archived" = false
)
UPDATE "Strategy" AS s
SET "archived" = true
FROM ranked AS r
WHERE s.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX "Strategy_userId_one_non_archived" ON "Strategy" ("userId") WHERE "archived" = false;
