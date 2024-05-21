# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install node modules, including dev modules
COPY package*.json ./
RUN npm ci --include dev
COPY . .

RUN npm run build
RUN npx esbuild server.ts --bundle --packages=external --outfile=server.js

# Final stage for app image
FROM base

# Copy built application code and install production dependencies
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/package*.json /app
RUN npm ci --omit dev

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "server.js" ]
