import { NextResponse } from 'next/server'
import { getMetricsData } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results = await getMetricsData()
  return NextResponse.json(results)
}
