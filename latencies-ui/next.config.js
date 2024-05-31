/** @type {import('next').NextConfig} */


const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  basePath: isProd ? '/regional-latencies' : undefined
}

module.exports = nextConfig
