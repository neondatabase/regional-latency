import Link from "next/link"

export function FAQ() {
  return (
    <ul className="sm:w-3/4 px-2 m-auto">
      <li className="pt-2">
        <h3 className="text-lg text-gray-400 pb-2">What is the purpose of this application?</h3>
        <p className="font-light pb-3">
          This application is designed to help you compare the latency of queries to Neon databases from different deployment platforms and regions. It helps you make an informed decision about where to deploy your Neon database and application backend.
        </p>
      </li>
      <li className="pt-2">
        <h3 className="text-lg text-gray-400 pb-2">Is the application and benchmark code open-source?</h3>
        <p className="font-light pb-3">
          Yes! You can find the code for this application in the <Link className="underline text-green-400" target="_blank" href="https://github.com/evanshortiss/neon-latency-tracker/">neon-latency-tracker repository on GitHub</Link>. The benchmark code that runs on each deployment platform is located in the <Link className="underline text-green-400" target="_blank" href="https://github.com/evanshortiss/neon-query-bench/">neon-query-bench repository on GitHub</Link>.
        </p>
      </li>
      <li className="pt-2">
        <h3 className="text-lg text-gray-400 pb-2">What configurations are used for testing?</h3>
        <p className="font-light pb-3">
          The Neon databases used for testing are set to our <Link className="underline text-green-400" target="_blank" href="https://neon.tech/docs/get-started-with-neon/production-checklist#select-the-right-compute-size">Free Tier size of 0.25 CU</Link> and have <Link className="underline text-green-400" target="_blank" href="https://neon.tech/docs/introduction/auto-suspend">auto-suspend</Link> disabled. This is to prevent cold starts being factored into latency measurements. Neon&apos;s <Link target="_blank" href="https://neon.tech/docs/serverless/serverless-driver" className="underline text-green-400">serverless driver</Link> is used to perform requests from each deployment platform to a Neon database.
        </p>
        <p className="font-light pb-3">
          Similarly, the deployment platforms involved are &quot;warmed up&quot; before we measure latency. This is to ensure that the latency measurements are as accurate as possible, and indicative of a real-world application handling production traffic.
        </p>
        <p className="font-light pb-3">
          The default instance size and scaling options are used on each deployment platform. For example, on DigitalOcean App Platform the instance size has 1vCPU and 1GB of memory.
        </p>
      </li>
      <li className="pt-2">
        <h3 className="text-lg text-gray-400 pb-2">Do you have benchmarks that demonstrate the overhead of cold starts?</h3>
        <p className="font-light pb-3">
          Sure do! If you&apos;re building an application that has low traffic and are curious about the impact of auto-suspend on query times, take a look at <Link className="underline text-green-400" target="_blank" href="https://neon-latency-benchmarks.vercel.app/">this benchmark instead</Link>.
        </p>
      </li>
    </ul>
  )
}



