import { from } from 'env-var'

export type ApplicationConfig = {
  BENCHMARK_QUERY_COUNT: number
}

export function getConfig(env: NodeJS.ProcessEnv): ApplicationConfig {
  const { get } = from(env)

  return {
    BENCHMARK_QUERY_COUNT: get('BENCHMARK_QUERY_COUNT')
      .default('10')
      .asIntPositive(),
  }
}
