-- Adds topic / keyConcepts / status to Question.
--
-- Prisma emits a table rebuild rather than ALTER TABLE ADD COLUMN here because
-- SQLite cannot add an index in the same step. Safe for this table: no foreign
-- keys point at it, and the INSERT...SELECT below names the old columns
-- explicitly, so the three new columns take their DEFAULT for all existing rows.
--
-- REVERSIBLE. SQLite cannot DROP COLUMN cheaply on a table with indexes, so the
-- down migration mirrors the rebuild in reverse. To roll this back by hand:
--
--   PRAGMA foreign_keys=OFF;
--   CREATE TABLE "old_Question" (
--       "id" TEXT NOT NULL PRIMARY KEY,
--       "role" TEXT NOT NULL,
--       "category" TEXT NOT NULL,
--       "difficulty" TEXT NOT NULL DEFAULT 'medium',
--       "question" TEXT NOT NULL,
--       "answer" TEXT NOT NULL,
--       "tags" TEXT NOT NULL DEFAULT '',
--       "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--       "updatedAt" DATETIME NOT NULL
--   );
--   INSERT INTO "old_Question" SELECT "id","role","category","difficulty",
--       "question","answer","tags","createdAt","updatedAt" FROM "Question";
--   DROP TABLE "Question";
--   ALTER TABLE "old_Question" RENAME TO "Question";
--   CREATE INDEX "Question_role_idx" ON "Question"("role");
--   CREATE INDEX "Question_category_idx" ON "Question"("category");
--   CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
--   PRAGMA foreign_keys=ON;
--
-- This discards topic / keyConcepts / status for every row. Export them first.

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "topic" TEXT NOT NULL DEFAULT '',
    "keyConcepts" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Question" ("answer", "category", "createdAt", "difficulty", "id", "question", "role", "tags", "updatedAt") SELECT "answer", "category", "createdAt", "difficulty", "id", "question", "role", "tags", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE INDEX "Question_role_idx" ON "Question"("role");
CREATE INDEX "Question_category_idx" ON "Question"("category");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_topic_idx" ON "Question"("topic");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
