import { NextResponse } from 'next/server';
import { getPercentiles } from '@/lib/metrics';

export const dynamic = "force-dynamic";

export async function GET() {
  const results = await getPercentiles()
  return NextResponse.json(results)
}
