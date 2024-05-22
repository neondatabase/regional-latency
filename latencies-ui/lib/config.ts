import { from } from 'env-var'

export type ApplicationConfig = {
  API_KEY: string,
  BENCHMARK_QUERY_COUNT: number,
}

export function getConfig (env: NodeJS.ProcessEnv): ApplicationConfig {
  const { get } = from(env)
  
  return {
    API_KEY: get('API_KEY').required().asString(),
    BENCHMARK_QUERY_COUNT: get('BENCHMARK_QUERY_COUNT').default('10').asIntPositive(),
  }
}
