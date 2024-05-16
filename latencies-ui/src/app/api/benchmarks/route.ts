import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BenchmarkResults, db } from '@/lib/drizzle';
import { gte, sql } from 'drizzle-orm';

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const platformNamesAndRegions = await getPlatformNamesAndRegions()
  const results: PlatformNamesAndRegionsWithPercentiles = {}

  for (const platform of Object.keys(platformNamesAndRegions)) {
    results[platform] = []

    for (const region of platformNamesAndRegions[platform]) {
      const { neonRegion, platformRegion } = region

      const percentiles = await db.execute(sql`
          WITH expanded AS (
              SELECT unnest(${BenchmarkResults.queryTimesCold}) AS value
              FROM ${BenchmarkResults}
              WHERE ${BenchmarkResults.platformName} = ${platform} AND ${BenchmarkResults.platformRegion} = ${platformRegion} AND ${BenchmarkResults.neonRegion} = ${neonRegion}
          )
          SELECT 
              PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS p75,
              PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY value) AS p90,
              PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) AS p95,
              PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) AS p99
          FROM expanded
      `)

      results[platform].push({
        neonRegion,
        platformRegion,
        percentiles: percentiles.rows
      })
    }
  }

  return NextResponse.json(results)
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
