import type { VercelRequest, VercelResponse } from '@vercel/node'
import nqb, { QueryRunnerMetadata } from 'neon-query-bench'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { platform, version, neonRegion } = nqb(process.env)

  return res.json({
    version,
    platformName: platform.getPlatformName(),
    platformRegion: platform.getPlatformRegion(),
    neonRegion
  } as QueryRunnerMetadata)
}
