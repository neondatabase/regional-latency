import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import {
  serial,
  text,
  timestamp,
  index,
  integer,
  pgSchema,
} from 'drizzle-orm/pg-core'
import { InferSelectModel, sql } from 'drizzle-orm'

export const schema = pgSchema('benchmarks')

export const BenchmarkRuns = schema.table(
  'runs',
  {
    id: serial('id').primaryKey(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (benchmarks) => {
    return {
      timestampIdx: index('benchmark_runs_ts_idx').on(benchmarks.timestamp),
    }
  }
)

export const BenchmarkResults = schema.table(
  'results',
  {
    id: serial('id').primaryKey(),
    run_id: integer('run_id').references(() => BenchmarkRuns.id),
    platformName: text('platform_name').notNull(),
    platformRegion: text('platform_region').notNull(),
    neonRegion: text('neon_region').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    queryTimes: integer('query_times').array().notNull(),
    queryTimesHot: integer('query_times_hot')
      .array()
      .notNull()
      .default(sql`ARRAY[]::int[]`),
    version: text('version').notNull(),
  },
  (benchmarks) => {
    return {
      timestampIdx: index('benchmark_results_ts_idx').on(benchmarks.timestamp),
    }
  }
)

export type BenchmarkRun = InferSelectModel<typeof BenchmarkRuns>
export type BenchmarkResult = InferSelectModel<typeof BenchmarkResults>

export const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, {
  schema: { BenchmarkRuns, BenchmarkResults },
  logger: process.env.DRIZZLE_LOG_ENABLED === 'true',
})
