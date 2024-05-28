import { getPercentiles } from "@/lib/metrics";
import {
	Table,
	TableHeader,
	TableHead,
	TableRow,
	TableBody,
	TableCell,
} from "./components/ui/table";
import { NeonRegion, PlatformName, neonRegionSortOrder, neonRegionsToNames, platformNames, platformNamesFormatted, platformRegionsToNames } from "@/lib/platforms";
import { FAQ } from "./components/ui/faq";
import MinMaxChart from "./components/ui/latency-chart";
import { deploymentPlatforms, neon } from "./components/icons";
import Link from "next/link";

export const revalidate = 5 * 60

export default async function Home() {
  const data = await getPercentiles()
  const sortedRegionKeys = Object.keys(data).sort((a, b) => {
    const r1 = a as NeonRegion
    const r2 = b as NeonRegion
    if (neonRegionSortOrder.indexOf(r1) > neonRegionSortOrder.indexOf(r2)) {
      return 1
    } else if (neonRegionSortOrder.indexOf(r1) < neonRegionSortOrder.indexOf(r2)) {
      return -1
    } else {
      return 0
    }
  })

	return (
		<main>
			<div className="p-6 space-y-4">
				<h2 className="font-title text-4xl leading-[0.9] tracking-extra-tight text-white">
					Neon Latency Dashboard
				</h2>
				<p className=" text-xl leading-snug tracking-extra-tight text-[#797d86] xl:text-lg lg:text-base">
					Observe the latency between various hosting platforms and Neon Postgres database regions.{" "}
					<Link
						className="text-white transition-colors duration-200 hover:text-primary-2 underline decoration-white/40 decoration-1 underline-offset-[5px] hover:decoration-black/60 lg:underline-offset-4"
						href="https://github.com/evanshortiss/neon-latency-tracker/"
            target="_blank"
					>
						Source code on GitHub
					</Link>
				</p>
			</div>
			<div className="flex flex-col gap-12 p-2 sm:p-6">
				{sortedRegionKeys.map((region) => (
					<div className="space-y-3" key={region}>
						<div className="relative z-10 rounded-[14px] bg-white bg-opacity-[0.03] p-1.5 backdrop-blur-[4px] xl:rounded-xl md:p-1">
							<div
								className="absolute inset-0 z-10 rounded-[inherit] border border-white/[0.04]"
								aria-hidden="true"
							/>
							<div
								className="absolute inset-[5px] z-10 rounded-[10px] border border-white/[0.04] mix-blend-overlay"
								aria-hidden="true"
							/>
							<div className="relative z-20 w-full flex flex-col rounded-[10px] border-opacity-[0.05] bg-[#0c0d0d] xl:rounded-lg gap-5 px-4 py-4 ">
                <div className="flex items-center gap-2">
                  {neon}
                  <h2 className="text-2xl font-medium">{neonRegionsToNames[region as NeonRegion]}</h2>
                </div>
                <p className="text-sm pb-4">Measure of time for a query between the following cloud providers and Neon&apos;s {neonRegionsToNames[region as NeonRegion]} region.</p>
                {
                  data[region].filter(item => platformNames.indexOf(item.platformName as PlatformName) !== -1).map((item) => {
                    return (
                      <div key={`${item.platformName}${item.platformRegion}`}>
                        <div className="flex space-x-2 items-center">
                          {deploymentPlatforms[item.platformName]}
                          <h3 className="text-xl">
                            {platformNamesFormatted[item.platformName as PlatformName]}
                          </h3>
                        </div>
                        <p className="text-sm pt-2 pb-4 text-gray-500">{platformRegionsToNames[item.platformName as PlatformName][item.platformRegion] || item.platformRegion}</p>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableHeader>P50</TableHeader>
                              <TableHeader>P75</TableHeader>
                              <TableHeader>P95</TableHeader>
                              <TableHeader>P99</TableHeader>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell className="w-1/5">
                                {Math.trunc(Number(item.percentiles.p50))} ms
                              </TableCell>
                              <TableCell className="w-1/5">
                                {Math.trunc(Number(item.percentiles.p75))} ms
                              </TableCell>
                              <TableCell className="w-1/5">
                                {Math.trunc(Number(item.percentiles.p95))} ms
                              </TableCell>
                              <TableCell className="w-1/5">
                                {Math.trunc(Number(item.percentiles.p99))} ms
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="pt-4" style={{height: '100px'}}>
                          <MinMaxChart data={item} key={`${item.neonRegion}${item.platformRegion}`}></MinMaxChart>
                        </div>
                      </div>
                    )
                  })
                }
							</div>
						</div>
					</div>
				))}
      <FAQ></FAQ>
			</div>{" "}
		</main>
	);
}
