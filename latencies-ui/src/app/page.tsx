import { getMetricsData } from '@/lib/metrics'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './components/ui/table'
import {
  NeonRegion,
  PlatformName,
  neonRegionSortOrder,
  neonRegionsToNames,
  platformNames,
  platformNamesFormatted,
  platformRegionsToNames,
} from '@/lib/platforms'
import { FAQ } from './components/ui/faq'
import MinMaxChart from './components/ui/latency-chart'
import { GitHubSVG, deploymentPlatforms, neon } from './components/icons'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Ensure that Next.js rerenders the page every 5 minutes to display the
// most recent data from cron runs.
export const revalidate = 5 * 60

export default async function Home() {
  const data = await getMetricsData()
  const sortedRegionKeys = Object.keys(data).sort((a, b) => {
    const r1 = a as NeonRegion
    const r2 = b as NeonRegion
    if (neonRegionSortOrder.indexOf(r1) > neonRegionSortOrder.indexOf(r2)) {
      return 1
    } else if (
      neonRegionSortOrder.indexOf(r1) < neonRegionSortOrder.indexOf(r2)
    ) {
      return -1
    } else {
      return 0
    }
  })

  return (
    <main className="p-4 max-w-screen-lg m-auto relative">
      <Link
        href="https://github.com/evanshortiss/neon-latency-tracker/"
        className="absolute fill-white transition-all hover:fill-neon right-0 top-0 pt-4 pr-4"
      >
        {GitHubSVG}
      </Link>
      <div className="space-y-4">
        <h2 className="font-title text-4xl leading-[0.9] tracking-extra-tight text-white">
          Neon Latency Dashboard
        </h2>
        <p className=" text-xl leading-snug tracking-extra-tight text-[#797d86] xl:text-lg lg:text-base">
          Observing the latency between various hosting platforms and Neon
          Postgres database regions.{' '}
        </p>
      </div>
      <div className="pt-8">
        <p>
          This page provides insight into the latency - or{' '}
          <Link
            href="https://www.cloudflare.com/en-gb/learning/cdn/glossary/round-trip-time-rtt/"
            target="_blank"
          >
            round-trip time (RTT)
          </Link>{' '}
          - for a single <code>SELECT</code> query between various cloud hosting
          platforms and Neon regions. Visit the{' '}
          <Link className="text-neon" href={`#faq`}>
            Frequently Asked Questions
          </Link>{' '}
          section to learn more about the data presented.
        </p>
      </div>
      {/* <p className="pt-6">Click on a Neon region to view the query latency between it and popular cloud provider infrastructure.</p> */}
      <div className="flex flex-col gap-12 pt-4">
        <Accordion
          type="single"
          defaultValue="region-us-east-1.aws.neon.tech"
          collapsible
          className="w-full"
        >
          {sortedRegionKeys.map((region) => (
            <AccordionItem key={region} value={`region-${region}`}>
              <AccordionTrigger
                className="bg-neutral-950"
                disabled={data[region as NeonRegion].length === 0}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {neon}
                    <h3 className="sm:text-2xl text-xl font-medium text-white">
                      {neonRegionsToNames[region as NeonRegion]}
                    </h3>
                  </div>
                  <div className="text-left">
                    <small className="text-md text-gray-500">
                      {data[region as NeonRegion].length === 0
                        ? 'Coming Soon'
                        : 'Data Available'}
                    </small>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="-z-10 relative space-y-3" key={region}>
                  <div className="relative z-10 rounded-[14px]">
                    <div
                      className="absolute inset-0 z-10 rounded-[inherit]"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-[5px] z-10 rounded-[10px] mix-blend-overlay"
                      aria-hidden="true"
                    />
                    <div className="relative z-20 w-full flex flex-col xl:rounded-lg gap-5">
                      <p className="pb-4">
                        A collection of percentiles and graphs showcasing the
                        distribution of query times, as well as the minimum and
                        maximum query times seen across various hosting
                        providers communicating with Neon&apos;s{' '}
                        {neonRegionsToNames[region as NeonRegion]} region. Open
                        an{' '}
                        <Link href="https://github.com/evanshortiss/neon-latency-tracker/issues/new?assignees=evanshortiss&labels=&projects=&template=region-provider-request.md&title=New+Region+or+Provider+Request">
                          issue on GitHub
                        </Link>{' '}
                        if you&apos;d like to see a new provider or region
                        added.
                      </p>
                      {data[region as NeonRegion]
                        .filter(
                          (item) =>
                            platformNames.indexOf(
                              item.platformName as PlatformName
                            ) !== -1
                        )
                        .map((item) => {
                          return (
                            <div
                              key={`${item.platformName}${item.platformRegion}`}
                            >
                              <div className="flex space-x-2 items-center">
                                {deploymentPlatforms[item.platformName]}
                                <h3 className="text-xl">
                                  {
                                    platformNamesFormatted[
                                      item.platformName as PlatformName
                                    ]
                                  }
                                </h3>
                              </div>
                              <p className="text-sm pt-2 pb-4 text-gray-500">
                                {platformRegionsToNames[
                                  item.platformName as PlatformName
                                ][item.platformRegion] || item.platformRegion}
                              </p>
                              <Table>
                                <TableHead className="text-center">
                                  <TableRow>
                                    <TableHeader>P50</TableHeader>
                                    <TableHeader>P75</TableHeader>
                                    <TableHeader>P95</TableHeader>
                                    <TableHeader>P99</TableHeader>
                                  </TableRow>
                                </TableHead>
                                <TableBody className="text-center">
                                  <TableRow>
                                    <TableCell className="w-1/5">
                                      {Math.trunc(Number(item.percentiles.p50))}{' '}
                                      ms
                                    </TableCell>
                                    <TableCell className="w-1/5">
                                      {Math.trunc(Number(item.percentiles.p75))}{' '}
                                      ms
                                    </TableCell>
                                    <TableCell className="w-1/5">
                                      {Math.trunc(Number(item.percentiles.p95))}{' '}
                                      ms
                                    </TableCell>
                                    <TableCell className="w-1/5">
                                      {Math.trunc(Number(item.percentiles.p99))}{' '}
                                      ms
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                              <div style={{ height: '150px' }}>
                                <MinMaxChart
                                  data={item}
                                  key={`${item.neonRegion}${item.platformRegion}`}
                                ></MinMaxChart>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <FAQ></FAQ>
      </div>{' '}
    </main>
  )
}
