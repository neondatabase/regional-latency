import { gte, sql } from "drizzle-orm"
import { BenchmarkResults, db } from "./drizzle"

type PlatformNamesAndRegions = {
  [platformName: string]: {
    platformRegion: string
    neonRegion: string
  }[]
}

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
  }
}
export type PlatformPercentiles = {
  [neonRegion: string]: {
    [platformName: string]: PercentileEntry[]
  }
}
type QueryResult = {
  platform_name: string
  neon_region: string
  platform_region: string
  timestamp: any
  p99: number
  p95: number
  p75: number
  p50: number
}

export async function getPercentiles (): Promise<PlatformPercentiles> {
    const queryResult = await db.execute<QueryResult>(sql`
      WITH unnested AS (
        SELECT 
            platform_name,
            neon_region,
            platform_region,
            timestamp,
            unnest(query_times_hot) AS query_time
        FROM 
            benchmarks.results
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

  const results = queryResult.rows.reduce((result, row) => {
    console.log(row)
    const { platform_name, platform_region, neon_region, timestamp, p50, p75, p95, p99 } = row

    if (!result[neon_region]) {
      result[neon_region] = {}
    }

    if (!result[neon_region][platform_name]) {
      result[neon_region][platform_name] = []
    }

    (result[neon_region][platform_name]).push({
      platformName: platform_name,
      platformRegion: platform_region,
      neonRegion: neon_region,
      timestamp,
      percentiles: {
        p50,
        p75,
        p95,
        p99
      }
    })

    return result
  }, {} as PlatformPercentiles)

  return results as PlatformPercentiles
}

async function getPlatformNamesAndRegions (): Promise<PlatformNamesAndRegions> {
  const ts = new Date()
  
  ts.setHours(ts.getHours() - 24)

  const platformsAndRegionsQuery = await db.select({
    platformName: BenchmarkResults.platformName,
    platformRegion: BenchmarkResults.platformRegion,
    neonRegion: BenchmarkResults.neonRegion
  })
    .from(BenchmarkResults)
    .where(gte(BenchmarkResults.timestamp, ts))
    .groupBy(BenchmarkResults.platformName, BenchmarkResults.platformRegion, BenchmarkResults.neonRegion)

  return platformsAndRegionsQuery.reduce((result, row) => {
    const { neonRegion, platformRegion, platformName } = row

    if (!result[platformName]) {
      result[platformName] = []
    }
    
    result[platformName].push({ platformRegion, neonRegion })

    return result
  }, {} as PlatformNamesAndRegions)
}
