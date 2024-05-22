import { NextRequest, NextResponse } from 'next/server'
import { QueryRunnerResult, QueryRunnerMetadata } from 'neon-query-bench'
import pino from 'pino'
import { BenchmarkRuns, BenchmarkResults, db } from '@/lib/drizzle'
import { randomUUID } from 'crypto'
import secureCron from '@/lib/secure-cron'
import PQueue from 'p-queue'
import { NQBResult } from '../../types'
import { getConfig } from '@/lib/config'

export const dynamic = "force-dynamic";

const log = pino({
  level: process.env.LOG_LEVEL || 'info'
})

const config = getConfig(process.env)

type Endpoint = {
  id: string
  url: string
  apiKey: string
}

export async function GET(req: NextRequest, res: NextRequest): Promise<NextResponse> {
  log.info('starting benchmark cron job')

  return secureCron(req, async () => {
    const timestamp = new Date()
    
    const endpoints = getBenchmarkEndpoints()
    const results = await Promise.allSettled(endpoints.map(e => processEndpoint(e)))
  
    log.info('finished procesing all endpoints. updating database with results')

    await db.transaction(async (tx) => {
      // Create an entry for this specific test run
      log.debug('insert new run to generate run ID')
      const row = await tx.insert(BenchmarkRuns).values({ timestamp }).returning()
      const { id } = row[0]

      // Store indivual results for this test run
      log.debug(`run id is: ${id}`)
      for (const r of results) {
        if (r.status === 'fulfilled') {
          const { value } = r

          log.debug(`insert endpoint result for run ${id}: ${ value }`)

          await tx.insert(BenchmarkResults).values({
            run_id: id,
            platformName: value.platformName,
            platformRegion: value.platformRegion,
            neonRegion: value.neonRegion,
            queryTimes: value.queryTimes.map(qt => qt.end - qt.start),
            version: value.version,
            timestamp
          })
        } else {
          log.error((r.reason as Error).message)
        }
      }
    })

    return NextResponse.json({
      message: `cron complete for ${endpoints.length} endpoints. see logs for errors and other details`
    }, {
      status: 200
    })
  })
}

/**
 * Send queries in series to the endpoint and wait up to 10 seconds for a result from each.
 */
async function processEndpoint (endpoint: Endpoint): Promise<NQBResult>{
  const { id, url, apiKey } = endpoint
  const controller = new AbortController()
  
  log.info(`processing endpoint ${id} with URL ${url}`)
  
  const q = new PQueue({ concurrency: 1, autoStart: true })
  const results: QueryRunnerResult[] = []

  for (let i = 0; i < config.BENCHMARK_QUERY_COUNT; i++) {
    q.add(async () => {
      const timer = setTimeout(() => {
        controller.abort()
      }, 10000)
    
      try {
        const benchUrl = safeConcatUrl('/benchmark/results', url)
        log.info(`fetching endpoint ${id} with URL ${benchUrl}`)
        const resp = await fetch(benchUrl, {
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
          results.push(json)
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          throw new Error(`failed to process endpoint ${id}. exception message was "${e.message}"`)
        } else {
          const errorId = randomUUID()
          log.error(`exception (${errorId}) processing ${id}:`)
          log.error(e)
    
          throw new Error(`exception thrown when processing endpoint ${id}. search logs for "${errorId}" for more information`)
        }
      }
    })
  }
  
  log.info(`waiting for queued requests to finish for endpoint ${id} with URL ${url}`)
  q.on('error', (e) => {
    log.error(`error processing fetch for endpointc ${id}`)
    log.error(e)
  })
  await q.onIdle()

  log.info(`queued requests finished for endpoint ${id} with URL ${url}. fetching endpoint metadata`)

  const metadata = await getRunnerMeatadata(url)
  
  log.info(`fetched metadata for endpoint ${id} with URL ${url}`)

  const result = {
    queryTimes: results.map(r => r.queryTimes).flat(),
    version: metadata.version,
    neonRegion: metadata.neonRegion,
    platformName: metadata.platformName,
    platformRegion: metadata.platformRegion
  }

  log.info(`finished processing endpoint ${id} with URL ${url}. Result is %j`, result)

  return result
}

async function getRunnerMeatadata (url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, 5000)

  const metadata: QueryRunnerMetadata = await fetch(safeConcatUrl('/benchmark/metadata', url), {
    signal: controller.signal
  })
    .then(r => r.json())
    .finally(() => clearTimeout(timer))

  return metadata
}


/**
 * Since we're kind of hacking the Vercel URLs, we need to make sure we're
 * concatenating them correctly and not losing the /api/nqb/$REGION portion.
 * @returns 
 */
function safeConcatUrl (path: string, base: string) {
  const baseUrl = new URL(base);
  const combinedPath = `${baseUrl.pathname.replace(/\/$/, '')}${path}`;

  return new URL(combinedPath, baseUrl.origin).toString();
}

/**
 * Target URLs/Keys take the format of "DB_BENCH_ENDPOINT_" followed by an identifier,
 * e.g "DB_BENCH_ENDPOINT_VERCEL_IAD" and "DB_BENCH_APIKEY_VERCEL_IAD"
 * @returns {Endpoint[]}
 */
function getBenchmarkEndpoints (): Endpoint[] {
  const vercelHost = process.env.VERCEL_URL?.includes('localhost') ? `http://${process.env.VERCEL_URL}` : `https://${process.env.VERCEL_URL}`
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    
    // Run the benchmark from Vercel to Neon US East 2
    DB_BENCH_ENDPOINT_VERCEL_US_EAST_2: new URL(`${vercelHost}/api/nqb/us-east-2`).toString(),
    DB_BENCH_APIKEY_VERCEL_US_EAST_2: process.env.NQB_API_KEY,

    // Run the benchmark from Vercel to Neon US East 1
    DB_BENCH_ENDPOINT_VERCEL_US_EAST_1: new URL(`${vercelHost}/api/nqb/us-east-1`).toString(),
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
