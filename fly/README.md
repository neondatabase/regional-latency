# Fly

## Local Development

```bash
cd fly

# Create a .env and define a database URL
cp .env.example .env
vi .env

npm i
npm run dev
```

## Deploy

```bash
# Create an initial config you're deploying for the first time
fly launch --dockerfile Dockerfile

# Deploy the code in the local directory
fly deploy
```
