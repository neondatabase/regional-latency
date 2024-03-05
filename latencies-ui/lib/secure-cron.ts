import { NextRequest, NextResponse } from "next/server";
import { log } from '@/lib/log'

export default async function secureCron (req: NextRequest, handler: () => Promise<NextResponse>) {
  // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  const authHeader = req.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    log.error('cron invocation terminated due to missing or incorrect authorization header')

    return Promise.resolve(
      new Response('Unauthorized', {
        status: 401,
      })
    );
  } else {
    return await handler()
  }
}
