import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  integer
} from 'drizzle-orm/pg-core'
import { InferSelectModel} from 'drizzle-orm'

neonConfig.fetchConnectionCache = true;

export const Benchmarks = pgTable(
  'benchmarks',
  {
    id: serial('id').primaryKey().notNull(),
    platformName: text('platform_name').notNull(),
    platformRegion: text('platform_region').notNull(),
    neonRegion: text('neon_region').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    queryTimes: integer('query_times').array().notNull()
  },
  (benchmarks) => {
    return {
      timestampIdx: index('benchmark_timestamp_idx').on(benchmarks.timestamp)
    }
  }
)

export type Benchmark = InferSelectModel<typeof Benchmarks>

export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema: { Benchmarks } })
