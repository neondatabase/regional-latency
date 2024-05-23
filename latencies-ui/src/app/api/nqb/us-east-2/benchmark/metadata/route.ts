import getBenchmarkInstance, { QueryRunnerMetadata } from "neon-query-bench"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export async function GET() {
  const { neonRegion, platform, version } = getBenchmarkInstance({
    // Required to identify this as a vercel environment
    ...process.env,

    // Hacks to force NQB environment settings
    NQB_DATABASE_URL: process.env.NEON_DB_US_EAST_2,
    NQB_API_KEY: process.env.NQB_API_KEY
  })

  return NextResponse.json({
    version,
    neonRegion,
    platformName: platform.getPlatformName(),
    platformRegion: platform.getPlatformRegion(),
  } as QueryRunnerMetadata)
}
