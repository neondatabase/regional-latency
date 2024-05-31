# Neon Latency Dashboard

This project provides a dashboard showing the latency you can expect when querying a Neon database from different regions.

## Architecture

This tool works by ingesting data from "runners" that check their latency to
Neon databases.

A runner is a function or server that uses the [neon-query-bench](https://github.com/evanshortiss/neon-query-bench)
tool to test how long it takes to run `SELECT` queries against a Neon
database. Internally, the [neon-query-bench](https://github.com/evanshortiss/neon-query-bench)
tool uses [Drizzle](https://orm.drizzle.team/) and the Neon [serverless driver](https://github.com/neondatabase/serverless/).

Each runner POSTs their results to a centralised function that stores them in
a Neon database. This function is protected by an API key.

- id
- platform_name - String, e.g "vercel"
- platform_region - String, e.g "iad1"
- latencies - Array of integers
- neon_region - (FK, or just string?)
