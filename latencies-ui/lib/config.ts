import { from } from 'env-var'

export type ApplicationConfig = {
  API_KEY: string
}

export function getConfig (env: NodeJS.ProcessEnv): ApplicationConfig {
  const { get } = from(env)
  
  return {
    API_KEY: get('API_KEY').required().asString()
  }
}
