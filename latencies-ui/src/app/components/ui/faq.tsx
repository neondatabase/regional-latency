import Link from "next/link"

export function FAQ() {
  return (
    <div className="sm:w-3/4 px-2 m-auto">
      <h2 id="faq" className="text-2xl pb-4">Frequently Asked Questions</h2>
      <ul>
        <li className="pt-2">
          <h3 className="text-lg text-gray-400 pb-2">What is the purpose of this application?</h3>
          <p className="font-light pb-3">
          This application allows you to compare the latency of queries to Neon databases across various deployment platforms and regions. It provides insights that could help you make informed decisions about where to deploy your application backend and Neon database.
          </p>
        </li>
        <li className="pt-2">
          <h3 className="text-lg text-gray-400 pb-2">Is the application and benchmark code open-source?</h3>
          <p className="font-light pb-3">
            Yes! You can find the code for this application in the <Link className="underline text-neon" target="_blank" href="https://github.com/evanshortiss/neon-latency-tracker/">neon-latency-tracker</Link> repository on GitHub. The benchmark code that runs on each deployment platform is located in the <Link className="underline text-neon" target="_blank" href="https://github.com/evanshortiss/neon-query-bench/">neon-query-bench</Link> repository on GitHub.
          </p>
        </li>
        <li className="pt-2">
          <h3 className="text-lg text-gray-400 pb-2">What configurations are used for testing?</h3>
          <p className="font-light pb-3">
            The Neon databases used for testing are set to our <Link className="underline text-neon" target="_blank" href="https://neon.tech/docs/get-started-with-neon/production-checklist#select-the-right-compute-size">Free Tier size of 0.25 CU</Link> and have <Link className="underline text-neon" target="_blank" href="https://neon.tech/docs/introduction/auto-suspend">auto-suspend</Link> disabled. This is to prevent cold starts being factored into latency measurements. Neon&apos;s <Link target="_blank" href="https://neon.tech/docs/serverless/serverless-driver" className="underline text-neon">serverless driver</Link> is used to perform requests from each deployment platform to a Neon database.
          </p>
          <p className="font-light pb-3">
            Similarly, the deployment platforms involved are &quot;warmed up&quot; before we measure latency. The warm up process involves performing a fixed number of queries prior to beginning latency measurements. This is to ensure that the latency measurements are indicative of a real-world application handling production traffic, i.e an application that doesn&apos;t see frequent cold starts.
          </p>
          <p className="font-light pb-3">
            The default instance size and scaling options are used on each deployment platform. For example, on DigitalOcean App Platform the instance size has 1vCPU and 1GB of memory.
          </p>
        </li>
        <li className="pt-2">
          <h3 className="text-lg text-gray-400 pb-2">Do you have benchmarks that demonstrate the overhead of Neon cold starts?</h3>
          <p className="font-light pb-3">
            Sure do! If you&apos;re building an application that has low traffic requirements and are curious about the impact of auto-suspend on query times, take a look at <Link className="underline text-neon" target="_blank" href="https://neon-latency-benchmarks.vercel.app/">this benchmark instead</Link>.
          </p>
        </li>
      </ul>
    </div>
  )
}



