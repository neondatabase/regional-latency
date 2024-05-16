CREATE SCHEMA "benchmarks";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benchmarks"."results" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer,
	"platform_name" text NOT NULL,
	"platform_region" text NOT NULL,
	"neon_region" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"query_times_cold" integer[] NOT NULL,
	"query_times_hot" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benchmarks"."runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "benchmark_results_ts_idx" ON "benchmarks"."results" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "benchmark_runs_ts_idx" ON "benchmarks"."runs" ("timestamp");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "benchmarks"."results" ADD CONSTRAINT "results_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "benchmarks"."runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
