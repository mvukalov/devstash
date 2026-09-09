-- System item types are shared across all users and have a NULL "userId".
-- The declarative @@unique([userId, name]) does not constrain them: Postgres
-- treats NULLs as distinct, so it happily allows two (NULL, 'snippet') rows
-- and cannot back an upsert on that key.
--
-- A partial unique index covers exactly the system rows. Prisma has no
-- declarative syntax for partial indexes, so this is written by hand and the
-- schema is annotated with a comment pointing here.
CREATE UNIQUE INDEX "ItemType_system_name_key"
  ON "ItemType" ("name")
  WHERE "userId" IS NULL;
