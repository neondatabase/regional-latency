import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPercentiles } from '@/lib/metrics';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const results = await getPercentiles()
  return NextResponse.json(results)
}
