import type { VercelRequest, VercelResponse } from '@vercel/node'
import nqb, { QueryRunnerResult } from 'neon-query-bench'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { runner } = nqb(process.env)

  const { queryTimes } = await runner({
    count: req.query['count'] ? (req.query['count'] as unknown as number) : 1,
    apiKey: process.env.NQB_API_KEY,
  })

  return res.json({ queryTimes } as QueryRunnerResult)
}
