# Vercel Neon Query Bench

## Deployment

Before starting, configure a Neon database to test against. This process is
explained in the [neon-query-bench](https://github.com/evanshortiss/neon-query-bench)
documentation.

1. Create a new project on Vercel.
1. Link the project to this Git repository, or a fork of it.
1. In the _General Settings_ for the project set:
   - Framework Preset: `Other`
   - Root Directory: `vercel/`
   - Node.js Version: `20.x`
1. Configure the following _Environment Variables_ in the project settings:
   - `NQB_API_KEY` - An API key to prevent spamming of the `/benchmark/results` endpoint.
   - `NQB_DATABASE_URL` - The Neon database URL to test against.

Make sure to redeploy the application whenever the environment variables are
changed.
