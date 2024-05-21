"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/src/app/components/ui/select";
import { Label } from "@/src/app/components/ui/label";
import React, { useState } from "react";
import { Card, CardContent } from "@/src/app/components/ui/card";

export default function Home() {
	const [selectedNeonRegion, setSelectedNeonRegion] = useState<string>();
	const [
		selectedDeploymentPlatformPercentiles,
		setSelectedDeploymentPlatformPercentiles,
	] = useState<{
		p50: number;
		p75: number;
		p90: number;
		p99: number;
	}>();

	const { isPending, error, data } = useQuery({
		queryKey: ["data"],
		queryFn: async () => {
			const res = await fetch(
				"http://localhost:3000/api/benchmarks/percentiles",
			);

			if (!res.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await res.json();

			return data;
		},
	});

	if (isPending) return "Loading...";

	if (error) return `An error has occurred: ${error.message}`;

	const neonRegions = Object.keys(data) ?? [];

	const optionsByNeonRegion =
		selectedNeonRegion &&
		data[selectedNeonRegion].reduce((acc, item) => {
			const { platformName, platformRegion, percentiles } = item;

			// Initialize the platform name group if it doesn't exist
			if (!acc[platformName]) {
				acc[platformName] = {};
			}

			// Assign the percentiles to the corresponding platform region
			acc[platformName][platformRegion] = percentiles;

			return acc;
		}, {});

	return (
		<main className="p-10">
			<div className="flex flex-col items-center gap-5 max-w-2xl mx-auto">
				<div className="flex flex-col md:flex-row gap-4 w-full justify-start">
					<div>
						<Label>Neon Region</Label>
						<Select
							onValueChange={(value) => {
								setSelectedNeonRegion(value);
								setSelectedDeploymentPlatformPercentiles(undefined);
							}}
							value={selectedNeonRegion}
						>
							<SelectTrigger className="w-[240px]">
								<SelectValue placeholder="Select a Neon Region" />
							</SelectTrigger>
							<SelectContent>
								{neonRegions.map((region) => (
									<SelectItem key={region} value={region}>
										{region}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label>Deployment Platform</Label>
						<Select
							disabled={!selectedNeonRegion}
							onValueChange={setSelectedDeploymentPlatformPercentiles}
							value={selectedDeploymentPlatformPercentiles}
						>
							<SelectTrigger className="w-[140px]">
								<SelectValue placeholder="Select a Deployment Platform" />
							</SelectTrigger>
							<SelectContent>
								{optionsByNeonRegion &&
									Object.keys(optionsByNeonRegion).map((platformName) => (
										<SelectGroup key={platformName}>
											<SelectLabel className="capitalize">
												{platformName}
											</SelectLabel>

											{Object.keys(optionsByNeonRegion[platformName]).map(
												(platformRegion) => {
													return (
														<SelectItem
															value={
																optionsByNeonRegion[platformName][
																	platformRegion
																]
															}
															key={platformRegion}
														>
															{platformRegion}
														</SelectItem>
													);
												},
											)}
										</SelectGroup>
									))}
							</SelectContent>
						</Select>
					</div>
				</div>
				{selectedDeploymentPlatformPercentiles && (
					<div className="flex flex-col md:flex-row gap-10 p-5 w-full  border border-input rounded-lg">
						{Object.entries(selectedDeploymentPlatformPercentiles).map(
							([percentile, value]) => (
								<div key={percentile}>
									<h2 className="text-lg capitalize">{percentile}</h2>
									<p className="text-4xl font-medium">
										{Math.trunc(Number(value))}{" "}
										<span className="text-lg">ms</span>
									</p>
								</div>
							),
						)}
					</div>
				)}
			</div>
		</main>
	);
}
