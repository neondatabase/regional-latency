ALTER TABLE "benchmarks"."results" RENAME COLUMN "query_times_cold" TO "query_times";--> statement-breakpoint
-- Following column already exists, must have messed up prior migrations...
-- ALTER TABLE "benchmarks"."results" ADD COLUMN "version" text NOT NULL;--> statement-breakpoint
ALTER TABLE "benchmarks"."results" DROP COLUMN IF EXISTS "query_times_hot";
