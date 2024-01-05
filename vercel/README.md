# Vercel

## Local Development

Setting up a local development flow will also require linking the project to an
account/team on Vercel. You'll be promoted to do this by `npx vercel dev`.

```bash
# Create .env file and add your Neon connection string as a DATABASE_URL variable
vi .env

# Load the DATABASE_URL variable into your session
source .env

# Install dependencies and start dev mode
npm i
npx vercel dev
```

The function will be available at `http://localhost:3000`, or a higher port if
`3000` is already in use.

## Deployment

```bash
# Set the DATABASE_URL on Vercel
npx vercel env add DATABASE_URL

# Deploy to Vercel
npx vercel deploy --prod
```

