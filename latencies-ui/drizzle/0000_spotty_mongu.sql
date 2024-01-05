CREATE TABLE IF NOT EXISTS "benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform_name" text NOT NULL,
	"platform_region" text NOT NULL,
	"neon_region" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"query_times" integer[] NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "benchmark_timestamp_idx" ON "benchmarks" ("timestamp");