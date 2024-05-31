# Fly

## Deployment

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
