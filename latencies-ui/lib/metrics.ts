import { sql } from "drizzle-orm"
import { BenchmarkResults, BenchmarkRuns, db } from "./drizzle"
import { log } from "./log"
import { NeonRegion, neonRegionsToNames } from "./platforms"
import { neon } from "@neondatabase/serverless"

export type PercentileEntry = {
  platformRegion: string
  platformName: string
  neonRegion: string
  timestamp: any
  percentiles: {
    p50: number
    p75: number
    p95: number
    p99: number
  },
  minMaxLatencies: {
    min: number
    max: number
    timestamp: string
  }[]
}
export type ResultSet = {
  [neonRegion: string]: {
    [platformName: string]: PercentileEntry[]
  }
}

export type NewResultSet = {
  [neonRegion in NeonRegion]: PercentileEntry[]
}

type PercentilesQueryResult = {
  platform_name: string
  neon_region: string
  platform_region: string
  timestamp: any
  p99: number
  p95: number
  p75: number
  p50: number
}

type MinMaxTimesQueryResult = {
  neon_region: string
  platform_region: string
  platform_name: string
  min_query_times: number[]
  max_query_times: number[]
  result_timestamps: string[]
}

// TODO: revist this function to see if we can improve it
export async function getMetricsData (): Promise<NewResultSet> {
  const minMaxLatenciesQueryResult = await db.execute<MinMaxTimesQueryResult>(sql`
    WITH recent_runs AS (
      SELECT ${BenchmarkRuns.id}, ${BenchmarkRuns.timestamp}
      FROM ${BenchmarkRuns}
      WHERE ${BenchmarkRuns.timestamp} >= NOW() - INTERVAL '12 hours'
    ),
    unnested_results AS (
        SELECT 
            r.run_id,
            r.neon_region,
            r.platform_region,
            r.platform_name,
            unnest(r.query_times_hot) AS query_time,
            r.timestamp
        FROM
            ${BenchmarkResults} r
        JOIN
            recent_runs rr ON r.run_id = rr.id
    ),
    min_max_per_result AS (
        SELECT 
            run_id,
            neon_region,
            platform_region,
            platform_name,
            timestamp,
            MIN(query_time) AS min_query_time,
            MAX(query_time) AS max_query_time
        FROM
            unnested_results
        GROUP BY 
            run_id,
            neon_region,
            platform_region,
            platform_name,
            timestamp
    )
    SELECT 
        neon_region,
        platform_region,
        platform_name,
        ARRAY_AGG(min_query_time) AS min_query_times,
        ARRAY_AGG(max_query_time) AS max_query_times,
        ARRAY_AGG(timestamp) AS result_timestamps
    FROM 
        min_max_per_result
    GROUP BY 
        neon_region,
        platform_region,
        platform_name
    ORDER BY 
        neon_region,
        platform_region,
        platform_name;
  `)

  const percentilesQueryResult = await db.execute<PercentilesQueryResult>(sql`
    WITH unnested AS (
        SELECT 
            platform_name,
            neon_region,
            platform_region,
            timestamp,
            unnest(query_times_hot) AS query_time
        FROM 
            benchmarks.results
        WHERE ${BenchmarkResults.timestamp} >= NOW() - INTERVAL '12 hours'
    ),
    percentiles AS (
        SELECT 
            platform_name,
            neon_region,
            platform_region,
            percentile_cont(0.99) WITHIN GROUP (ORDER BY query_time) AS p99,
            percentile_cont(0.95) WITHIN GROUP (ORDER BY query_time) AS p95,
            percentile_cont(0.75) WITHIN GROUP (ORDER BY query_time) AS p75,
            percentile_cont(0.50) WITHIN GROUP (ORDER BY query_time) AS p50
        FROM 
            unnested
        GROUP BY
            platform_name,
            neon_region,
            platform_region
    ),
    latest_timestamp AS (
        SELECT DISTINCT ON (platform_name, neon_region, platform_region) 
            platform_name, 
            neon_region, 
            platform_region, 
            timestamp
        FROM 
            benchmarks.results
        ORDER BY 
            platform_name, neon_region, platform_region, timestamp DESC
    )
    SELECT 
        p.platform_name,
        p.neon_region,
        p.platform_region,
        l.timestamp,
        p.p99,
        p.p95,
        p.p75,
        p.p50
    FROM 
        percentiles p
    JOIN 
        latest_timestamp l 
    ON 
        p.platform_name = l.platform_name 
        AND p.neon_region = l.neon_region 
        AND p.platform_region = l.platform_region
    ORDER BY 
        p.platform_name,
        p.neon_region,
        p.platform_region;
  `)

  const results = percentilesQueryResult.rows.reduce((result, row) => {
    const { platform_name, platform_region, timestamp, p50, p75, p95, p99 } = row
    const neon_region = row.neon_region as NeonRegion
    const correspondingMinMaxLatencyRow = minMaxLatenciesQueryResult.rows.find((minMaxRow) => {
      return minMaxRow.neon_region === neon_region && minMaxRow.platform_region === platform_region && minMaxRow.platform_name === platform_name
    })

    if (!result[neon_region]) {
      result[neon_region] = []
    }
    
    result[neon_region].push({
      percentiles: {
        p50,
        p75,
        p95,
        p99
      },
      platformName: platform_name,
      neonRegion: neon_region,
      platformRegion: platform_region,
      timestamp,
      minMaxLatencies: correspondingMinMaxLatencyRow ? correspondingMinMaxLatencyRow.min_query_times.map((min, index) => {
        return {
          min,
          max: correspondingMinMaxLatencyRow.max_query_times[index],
          timestamp: correspondingMinMaxLatencyRow.result_timestamps[index]
        }
      }).sort((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1) : []
    })

    log.debug('metrics data: %j', result)

    return result
  }, {} as NewResultSet)

  // Fill in any missing regions with empty arrays
  Object.keys(neonRegionsToNames).forEach((neonRegion) => {
    if (!results[neonRegion as NeonRegion]) {
      results[neonRegion as NeonRegion] = []
    }
  })

  return results
}
