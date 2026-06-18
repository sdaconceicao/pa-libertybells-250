-- Consolidate `favorite` and `been_to` into a single `visited` table.
-- Safe on databases with the old tables, or greenfield installs where only
-- `visited` is needed.

CREATE TABLE IF NOT EXISTS "visited" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bell_id" text NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "visited_user_bell_unique" UNIQUE("user_id","bell_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "visited" ADD CONSTRAINT "visited_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 IF to_regclass('public.favorite') IS NOT NULL THEN
  INSERT INTO "visited" ("id", "user_id", "bell_id", "status", "updated_at")
  SELECT gen_random_uuid()::text, "user_id", "bell_id", 'want', "created_at"
  FROM "favorite"
  ON CONFLICT ("user_id", "bell_id") DO NOTHING;
 END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 IF to_regclass('public.been_to') IS NOT NULL THEN
  INSERT INTO "visited" ("id", "user_id", "bell_id", "status", "updated_at")
  SELECT gen_random_uuid()::text, "user_id", "bell_id", 'been', "visited_at"
  FROM "been_to"
  ON CONFLICT ("user_id", "bell_id") DO UPDATE
  SET "status" = EXCLUDED."status", "updated_at" = EXCLUDED."updated_at";
 END IF;
END $$;
--> statement-breakpoint
DROP TABLE IF EXISTS "favorite";
--> statement-breakpoint
DROP TABLE IF EXISTS "been_to";
