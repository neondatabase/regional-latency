export type PlatformTarget = {
  url: string
  meatadata: Record<string, string>
}

export type PlatformConfig = {
  name: string
  targets: PlatformTarget[]
}

export type QueryBenchmarkResponse = {
  region: string
  data: {
    // We don't need the result, though all fetch requests should
    // return the same JSON response data...
    results: any
    queryTimes: { start: number, end: number }[]
    neonRegion: string
  }
}
