import { QueryRunnerMetadata } from 'neon-query-bench'

export type PlatformTarget = {
  url: string
  meatadata: Record<string, string>
}

export type PlatformConfig = {
  name: string
  targets: PlatformTarget[]
}

export type NQBResult = QueryRunnerMetadata & {
  queryTimes: number[]
  queryTimesHot: number[]
}
