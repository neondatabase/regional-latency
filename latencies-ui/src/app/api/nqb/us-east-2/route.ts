import getBenchmarkInstance, { QueryRecordPayload } from "neon-query-bench"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { runner, platform } = getBenchmarkInstance({
    NQB_DATABASE_URL: process.env.NEON_DB_US_EAST_2,
    NQB_API_KEY: process.env.NQB_API_KEY
  })

  const queryRunnerResult = await runner({
    count: 10,
    apiKey: process.env.NQB_API_KEY
  })

  const response: QueryRecordPayload = {
    queryRunnerResult,
    platformName: platform.getPlatformName(),
    platformRegion: platform.getPlatformRegion()
  }

  return NextResponse.json(response)
}
