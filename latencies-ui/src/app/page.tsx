'use client'

import { PlatformPercentiles } from '@/lib/metrics';
import { useEffect, useState } from 'react';

export default function Home() {
  const [percentiles, setPercentiles] = useState<PlatformPercentiles>({})
  const [platformNames, setPlatformNames] = useState<string[]|undefined>()
  const [selectedPlatform, setSelectedPlatform] = useState<string|undefined>()
  const [selectedPlatformRegion, setSelectedPlatformRegion] = useState<string|undefined>()
  const [selectedNeonRegion, setSelectedNeonRegion] = useState<string|undefined>()

  useEffect(() => {
    async function fetchData() {
      const json: PlatformPercentiles = await fetch('/api/benchmarks/percentiles').then(res => res.json())
      const platformNames = Object.keys(json)
      
      setPercentiles(json)

      setPlatformNames(platformNames)
      onPlatformChange(platformNames[0], json)
    }
    fetchData()
  }, [])

  if (!platformNames || !selectedPlatform || !selectedPlatformRegion || !selectedNeonRegion) return <p>Loading...</p>

  const platformSelectOptions = platformNames.map((platform, index) => (
    <option className='capitalize' key={index} value={platform}>{platform}</option>
  ))

  // Dedeuplicate the platform regions using a Set, e.g we test from Vercel IAD1
  // to both us-east1 and us-east2 of Neon so we the same Vercel region twice in
  // the percentiles - once for each Neon region. We only want to show it once in
  // the dropdown.
  const platformRegionSelectOptions = Array.from(new Set(percentiles[selectedPlatform].map((region) => region.platformRegion))).map((region, index) => (
    <option className='capitalize' key={index} value={region}>{region}</option>
  ))

  const neonRegionSelectOptions = percentiles[selectedPlatform].filter((entry) => entry.platformRegion === selectedPlatformRegion).map((region, index) => (
    <option className='capitalize' key={index} value={region.neonRegion.split('.')[0]}>{region.neonRegion.split('.')[0]}</option>
  ))

  function onPlatformChange(platform: string, percentiles: PlatformPercentiles) {
    setSelectedPlatform(platform)
    setSelectedPlatformRegion(percentiles[platform][0].platformRegion)
    setSelectedNeonRegion(percentiles[platform][0].neonRegion.split('.')[0])
  }

  function onRegionChange (platform: string, region: string, percentiles: PlatformPercentiles) {
    setSelectedPlatformRegion(region)
    const regionItem = percentiles[platform].find((entry) => entry.platformRegion === region)
    
    if (!regionItem) throw new Error('Could not find region item')

    setSelectedNeonRegion(regionItem.neonRegion.split('.')[0])
  }

  function getPercentilesForPlatformAndRegion(platform: string, region: string, neonRegion: string) {
    const result = percentiles[platform].find((entry) => {
      return entry.platformRegion === region && entry.neonRegion.split('.')[0] === neonRegion
    })?.percentiles

    return Object.entries(result || {})
  }

  return (
    <main>
      {/* <p className='text-center'>This application sends requests to the providers listed, and those in turn issue queries against a Neon database. All of the providers issue a series of one-shot queries using the <a href='https://github.com/neondatabase/serverless#readme' className='underline text-emerald-400' target='_blank'>@neondatabase/serverless</a> driver. The code that issues the queries can be found in the <a href="https://github.com/evanshortiss/neon-query-bench" target='_blank'>neon-query-bench repository on GitHub</a>.</p> */}
      <div className="selectors flex w-1/2 m-auto">
        <div>
          <label htmlFor="platform" className="block mb-2">Platform</label>
          <select onChange={(e) => onPlatformChange(e.target.value, percentiles)} className='flex-1 dark:text-white dark:bg-gray-800 capitalize p-2' name="platform" id="platform">
            {platformSelectOptions}
          </select>
        </div>
        <div>
          <label htmlFor="region" className="block mb-2">Platform Region</label>
          <select onChange={(e) => onRegionChange(selectedPlatform, e.target.value, percentiles)} className='flex-1 dark:text-white dark:bg-gray-800 uppercase p-2' name="region" id="region">
            {platformRegionSelectOptions}
          </select>
        </div>
        <div>
          <label htmlFor="neonRegion" className="block mb-2">Neon Region</label>
          <select onChange={(e) => setSelectedNeonRegion(e.target.value)} className='flex-1 dark:text-white dark:bg-gray-800 uppercase p-2' name="neonRegion" id="neonRegion">
            {neonRegionSelectOptions}
          </select>
        </div>
      </div>

      <div className='pt-6'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getPercentilesForPlatformAndRegion(selectedPlatform, selectedPlatformRegion, selectedNeonRegion).map(([key, value]) => (
            <div key={key} className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg font-semibold">{key}</h3>
              <p>{Math.round(value)}ms</p>
            </div>
          ))}
        </div>
      </div>
      
    </main>
  );
}
