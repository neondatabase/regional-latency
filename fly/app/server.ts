import http from 'node:http'
import log from 'barelog'
import nqb, { QueryRecordPayload } from 'neon-query-bench'

const server = http.createServer(listener)
const { platform, runner, version } = nqb(process.env)

async function listener(req: http.IncomingMessage, res: http.ServerResponse) {
  const pathname = req.url
  
  if (pathname === '/') {
    try {
      log('incoming headers: ', JSON.stringify(req.headers, null, 2))
      console.log('set api key', process.env.NQB_API_KEY)
      
      const queryRunnerResult = await runner({
        count: 10,
        apiKey: req.headers['x-api-key'] as string|undefined
      })

      const payload: QueryRecordPayload = {
        platformName: platform.getPlatformName(),
        platformRegion: platform.getPlatformRegion(),
        queryRunnerResult,
        version
      }

      res.setHeader('content-type', 'application/json')
      res.writeHead(200)
      res.write(JSON.stringify(payload))
      res.end()
    } catch (e) {
      if (e instanceof Error && e.message.includes('API_KEY')) {
        res.writeHead(401).end('unauthorized')
      } else {
        log('error running nqb')
        log(e)
        res.writeHead(500).end('internal server error')
      }
    }
  } else {
    res.writeHead(404).end('not found')
  }
}

server.listen(3000, '0.0.0.0', () => {
  log('Server is listening on port 3000')
})

;['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    log(`Exiting due to ${signal}`)
    process.exit(0)
  })
});
