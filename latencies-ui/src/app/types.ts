import { QueryRunnerMetadata, QueryRunnerResult } from "neon-query-bench"

export type PlatformTarget = {
  url: string
  meatadata: Record<string, string>
}

export type PlatformConfig = {
  name: string
  targets: PlatformTarget[]
}

export type NQBResult = QueryRunnerMetadata&QueryRunnerResult
