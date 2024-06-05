# Neon Regional Latency Dashboard

View the dashboard at [neon.tech/demos/regional-latency](https://neon.tech/demos/regional-latency).

## Architecture

This tool works by collecting data from "runners" that check their latency to a
configured Neon database.

![Regional Latency Architecture](/architecture.png)

A runner is a function or server that implements the
[neon-query-bench](https://github.com/evanshortiss/neon-query-bench) module.
We're measuring how long it takes to receive a response to a submillisecond
`SELECT` query against a Neon database.

## Repository Structure

## latencies-ui

A Next.js application that:

- Collects results from runners every 15 minutes.
- Renders results as a set of percentiles and graphs.

## fly

Contains a set of configurations to deploy runners in various Fly.io regions.

Refer to the [README](/fly/README.md) in that folder form more details.

## digitalocean

Contains a set of configurations to deploy runners on DigitalOcean's AppPlatform regions.

## railway

TODO
