import getBenchmarkInstance, { QueryRecordPayload } from "neon-query-bench"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { runner, platform } = getBenchmarkInstance(process.env)

  const queryRunnerResult = await runner({
    apiKey: process.env.NQB_API_KEY ? request.headers.get('x-api-key') ?? undefined : undefined
  })

  const response: QueryRecordPayload = {
    queryRunnerResult,
    platformName: platform.getPlatformName(),
    platformRegion: platform.getPlatformRegion()
  }

  return NextResponse.json(response)
}
