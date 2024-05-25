import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the purpose of this application?</AccordionTrigger>
        <AccordionContent>
          This application is designed to help you compare the latency of queries to Neon databases from different deployment platforms and regions. It helps you make an informed decision about where to deploy your Neon database and application backend.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is the application and benchmark code open-source?</AccordionTrigger>
        <AccordionContent>
          Yes! You can find the code for this application in the <Link className="underline text-green-400" href="https://github.com/evanshortiss/neon-latency-tracker/">neon-latency-tracker repository on GitHub</Link>. The benchmark code that runs on each deployment platform is located in the <Link className="underline text-green-400" href="https://github.com/evanshortiss/neon-query-bench/">neon-query-bench repository on GitHub</Link>.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What configurations are used for testing?</AccordionTrigger>
        <AccordionContent>
          <p>The Neon databases used for testing are set to our <Link className="underline text-green-400" href="https://neon.tech/docs/get-started-with-neon/production-checklist#select-the-right-compute-size">Free Tier size of 0.25 CU</Link> and have <Link className="underline text-green-400" href="https://neon.tech/docs/introduction/auto-suspend">auto-suspend</Link> disabled. This is to prevent cold starts being factored into latency measurements. Neon&apos;s <Link href="https://neon.tech/docs/serverless/serverless-driver" className="underline text-green-400">serverless driver</Link> is used to perform requests from each deployment platform to a Neon database.</p>
          <br />
          <p>Similarly, the deployment platforms involved are &quot;warmed up&quot; before we measure latency. This is to ensure that the latency measurements are as accurate as possible, and indicative of a real-world application handling production traffic.</p>
          <br />
          <p>The default instance size and scaling options are enabled each deployment platform. For example, on DigitalOcean App Platform  the instance size has 1vCPU and 1GB of memory.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Do you have benchmarks that demonstrate the overhead of cold starts?</AccordionTrigger>
        <AccordionContent>
          Sure do! If you&apos;re building an application that has low traffic and are curious about the impact of auto-suspend on query times, take a look at <Link className="underline text-green-400" href="https://neon-latency-benchmarks.vercel.app/">this benchmark instead</Link>.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
