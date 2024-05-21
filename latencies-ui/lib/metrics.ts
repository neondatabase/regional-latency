import { gte, sql } from "drizzle-orm"
import { BenchmarkResults, db } from "./drizzle"

type PlatformNamesAndRegions = {
  [platformName: string]: {
    platformRegion: string
    neonRegion: string
  }[]
}

type PlatformNamesAndRegionsWithPercentiles = {
  [platformName: string]: {
    platformRegion: string
    neonRegion: string
    percentiles: any
  }[]
}

export type PercentileEntry = {
  platformRegion: string
  neonRegion: string
  percentiles: {
    p50: number
    p75: number
    p90: number
    p99: number
  }
}
export type PlatformPercentiles = {
  [platformName: string]: PercentileEntry[]
}
type QueryResult = {
  platform_name: string
  neon_region: string
  platform_region: string
  p99: number
  p90: number
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
              percentile_cont(0.90) WITHIN GROUP (ORDER BY query_time) AS p90,
              percentile_cont(0.75) WITHIN GROUP (ORDER BY query_time) AS p75,
              percentile_cont(0.50) WITHIN GROUP (ORDER BY query_time) AS p50
          FROM 
              unnested
          GROUP BY 
              platform_name,
              neon_region,
              platform_region
      )
      SELECT 
          platform_name,
          neon_region,
          platform_region,
          p99,
          p90,
          p75,
          p50
      FROM 
          percentiles
      ORDER BY 
          platform_name,
          neon_region,
          platform_region;
  `)

  const results = queryResult.rows.reduce((result, row) => {
    const { platform_name, platform_region, neon_region, p50, p75, p90, p99 } = row

    if (!result[platform_name]) {
      result[platform_name] = []
    }

    (result[platform_name]).push({
      platformRegion: platform_region,
      neonRegion: neon_region,
      percentiles: {
        p50,
        p75,
        p90,
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
