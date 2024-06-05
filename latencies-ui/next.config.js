/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  basePath: isProd ? '/demos/regional-latency' : undefined,
}

module.exports = nextConfig
