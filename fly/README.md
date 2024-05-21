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

## Building a Container Image

1. Install Docker or Podman.
2. If on macOS, make sure to enable the containerd setting on Docker.
3. Run `npm run build:image`.

## Pushing a Container Image

Currently, the container image should be pushed to `docker.io/evanatneon/nqb-fly`
using `podman push` or `docker push`.


## Deploy

Fly's `launch` command doesn't accept a path to a specific _.toml_ file. To
workaround this, create a directory for each region and copy an existing
_fly.toml_ into the directory.

Run `fly launch` from the folder of the region you wish to launch, then set the
database secret, as shown in the sample commands below.

```bash
cd regions/iad

# Create an initial config you're deploying for the first time
fly launch 

# Set the Neon database URL
fly secrets set NQB_DATABASE_URL='postgresql://foo:bar@ep-adj-noun-12345.us-east-2.aws.neon.tech/neondb?sslmode=require'
```
