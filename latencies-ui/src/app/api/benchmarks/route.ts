import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Benchmarks, db } from '@/lib/drizzle';
import { gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const ts = new Date()
  
  ts.setHours(ts.getHours() - 1)

  const results = await db.select().from(Benchmarks).where(
    gte(Benchmarks.timestamp, ts)
  )

  return NextResponse.json(results)
}
