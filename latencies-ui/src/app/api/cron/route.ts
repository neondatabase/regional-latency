import { NextRequest, NextResponse } from 'next/server'
import { QueryRecordPayload } from 'neon-query-bench'
import pino from 'pino'
import { Benchmarks, db } from '@/lib/drizzle'
import { randomUUID } from 'crypto'
import secureCron from '@/lib/secure-cron'

export const dynamic = "force-dynamic";

const log = pino({
  level: process.env.LOG_LEVEL || 'info'
})

type Endpoint = {
  id: string
  url: string
  apiKey: string
}

export async function GET(req: NextRequest, res: NextRequest) {
  log.info('starting benchmark cron job')

  secureCron(req, async () => {
    const timestamp = new Date()
    
    const endpoints = getBenchmarkEndpoints()
    const results = await Promise.allSettled(endpoints.map(e => processEndpoint(e)))
  
    log.info('finished procesing all endpoints. updating database with results')

    for (const r of results) {
      if (r.status === 'fulfilled') {
        const { value } = r
  
        await db.insert(Benchmarks).values({
          platformName: value.platformName,
          platformRegion: value.platformRegion,
          neonRegion: value.queryRunnerResult.neonRegion,
          queryTimes: value.queryRunnerResult.queryTimes.map(qt => qt.end - qt.start),
          timestamp
        })
      } else {
        log.error((r.reason as Error).message)
      }
    }
    
    return NextResponse.json({
      message: `cron complete for ${endpoints.length} endpoints. see logs for errors and other details`
    }, {
      status: 200
    })
  })


}

/**
 * Reach out to the endpoint and wait up to 10 seconds for a result.
 * @param endpoint 
 * @returns {Promise<QueryRecordPayload>}
 */
async function processEndpoint (endpoint: Endpoint): Promise<QueryRecordPayload>{
  const { id, url, apiKey } = endpoint
  const controller = new AbortController()
  
  log.info(`processing endpoint ${id} with URL ${url}`)

  const timer = setTimeout(() => {
    controller.abort()
  }, 10000)

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'x-api-key': apiKey
      }
    })

    clearTimeout(timer)

    if (resp.status !== 200) {
      const text = await resp.text()
      throw new Error(`received status code ${resp.status} from endpoint and text ${text}`)
    } else {
      const json = await resp.json()

      // TODO: schema validation on response
      return json as QueryRecordPayload
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`failed to process endpoint ${id}. exception message was "${e.message}"`)
    } else {
      const errorId = randomUUID()
      log.error(`exception (${errorId}) processing ${id}`)
      log.error(e)

      throw new Error(`exception thrown when processing endpoint ${id}. search logs for "${errorId}" for more information`)
    }
  }
}

/**
 * Target URLs/Keys take the format of "DB_BENCH_ENDPOINT_" followed by an identifier,
 * e.g "DB_BENCH_ENDPOINT_VERCEL_IAD" and "DB_BENCH_APIKEY_VERCEL_IAD"
 * @returns {Endpoint[]}
 */
function getBenchmarkEndpoints (): Endpoint[] {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    
    // Run the benchmark from Vercel to Neon US East 2
    DB_BENCH_ENDPOINT_VERCEL_US_EAST_2: new URL(`https://${process.env.VERCEL_URL}/api/nqb/us-east-2`).toString(),
    DB_BENCH_APIKEY_VERCEL_US_EAST_2: process.env.NQB_API_KEY,

    // Run the benchmark from Vercel to Neon US East 1
    DB_BENCH_ENDPOINT_VERCEL_US_EAST_1: new URL(`https://${process.env.VERCEL_URL}/api/nqb/us-east-1`).toString(),
    DB_BENCH_APIKEY_VERCEL_US_EAST_1: process.env.NQB_API_KEY
  }

  const URL_PREFIX = 'DB_BENCH_ENDPOINT_'
  const API_KEY_PREFIX = 'DB_BENCH_APIKEY_'
  const endpoints: Endpoint[] = []

  Object.keys(env).forEach((varName) => {
    if (varName.startsWith(URL_PREFIX)) {
      const id = varName.split(URL_PREFIX)[1]
      
      if (!id) {
        log.warn(`variable named ${varName} is missing suffix`)
      } else {
        log.info(`parsing endpoint config for environment variable named "${varName}"`)
        const apiKey = env[`${API_KEY_PREFIX}${id}`]
        const url = env[varName]

        if (!apiKey || !url) {
          log.warn(`expected api key in variable "${API_KEY_PREFIX}${id}" or URL in ${varName}, but they were missing`)
        } else {
          log.info(`adding benchmark endpoint with id "${id}"`)
          endpoints.push({
            id,
            url,
            apiKey
          })
        }
      }
    }
  })

  return endpoints
}
