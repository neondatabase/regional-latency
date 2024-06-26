import Link from 'next/link'
import styles from './faq.module.css'

export function FAQ() {
  return (
    <div className="sm:w-3/4 px-2 m-auto">
      <h2 id="faq" className="text-2xl pb-4">
        Frequently Asked Questions
      </h2>
      <ul className={styles.list}>
        <li className="pt-2">
          <h3 className={styles.header}>What is the purpose of this application?</h3>
          <p className={styles.paragraph}>
            By understanding the latency of a basic <code>SELECT</code> query to a Neon database from your preferred
            hosting platform and region, you can make informed decisions about where to deploy your application backend
            and Neon database to reduce the impact of latency between the two.
          </p>
        </li>
        <li className="pt-2">
          <h3 className={styles.header}>
            How can I estimate the impact of database queries on API response times using this dashboard?
          </h3>
          <p className={styles.paragraph}>
            You can use the P50 and P99 measurements to approximate the best and worst case round-trip time for each
            database query issued from your hosting platform to your Postgres database on Neon. Optimize your queries,
            use <code>JOIN</code>s, and batch queries in a single round-trip to reduce the impact of latency on the
            performance of your application.
          </p>
        </li>
        <li className="pt-2">
          <h3 className={styles.header}>How often is the data updated?</h3>
          <p className={styles.paragraph}>New data is collected every 15 minutes.</p>
        </li>
        <li className="pt-2">
          <h3 className={styles.header}>Is the application and benchmark code open-source?</h3>
          <p className={styles.paragraph}>
            Yes. Application code can be found in the{' '}
            <Link target="_blank" href="https://github.com/evanshortiss/neon-latency-tracker/">
              neon-latency-tracker
            </Link>{' '}
            repository on GitHub. Benchmark code that runs on each hosting platform is located in the{' '}
            <Link target="_blank" href="https://github.com/evanshortiss/neon-query-bench/">
              neon-query-bench
            </Link>{' '}
            repository on GitHub.
          </p>
        </li>
        <li className="pt-2">
          <h3 className={styles.header}>How are the Neon Postgres databases configured for testing?</h3>
          <p className={styles.paragraph}>
            The Neon databases used for testing are set to our{' '}
            <Link
              target="_blank"
              href="https://neon.tech/docs/get-started-with-neon/production-checklist#select-the-right-compute-size"
            >
              Free Tier size of 0.25 CU
            </Link>
            . Neon&apos;s{' '}
            <Link target="_blank" href="https://neon.tech/docs/introduction/auto-suspend">
              auto-suspend feature
            </Link>{' '}
            is disabled to prevent cold starts being factored into latency measurements. Production applications will
            rarely encounter a cold start, since they receive consistent traffic.
          </p>
        </li>
        <li>
          <h3 className={styles.header}>What Postgres driver is used?</h3>
          <p className={styles.paragraph}>
            Neon&apos;s{' '}
            <Link target="_blank" href="https://neon.tech/docs/serverless/serverless-driver">
              serverless driver for Postgres
            </Link>{' '}
            is used to perform requests from each hosting platform to a Neon database. This driver is designed to
            provide a low latency experience on both serverless and traditional hosting platforms.
          </p>
        </li>
        <li>
          <h3 className={styles.header}>Are the tests performed using an ORM?</h3>
          <p className={styles.paragraph}>
            <Link
              href="https://orm.drizzle.team/docs/get-started-postgresql#neon-postgres"
              target="_blank"
              className="text-neon"
            >
              Drizzle ORM
            </Link>{' '}
            is used to perform the queries in the benchmark. Many projects use ORMs to interact with Postgres and to
            manage their schemas. Using an ORM in the benchmark provides a more realistic set of measurements.
          </p>
        </li>
        <li className="pt-2">
          <h3 className={styles.header}>What resources are provisioned on the hosting platforms?</h3>
          <p className={styles.paragraph}>
            The default instance size and scaling options are used on each hosting platform. For example, on
            DigitalOcean App Platform the instance has 1vCPU and 1GB of memory.
          </p>
        </li>
        <li>
          <h3 className={styles.header}>Are serverless environments warmed up prior to testing?</h3>
          <p className={styles.paragraph}>
            Yes. The deployment platforms involved are &quot;warmed up&quot; before we measure latency. The warm up
            process involves performing a fixed number of queries prior to beginning latency measurements. This is to
            ensure that the latency measurements are indicative of a real-world application handling production traffic,
            i.e an application that doesn&apos;t see frequent{' '}
            <Link
              href="https://vercel.com/guides/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel"
              target="blank"
            >
              cold starts
            </Link>
            .
          </p>
        </li>
        <li className="pt-2">
          <h3 className={styles.header}>Do you have benchmarks that demonstrate the overhead of Neon cold starts?</h3>
          <p className={styles.paragraph}>
            Sure do! If you&apos;re building an application that has low traffic requirements and are curious about the
            impact of auto-suspend on query times, take a look at{' '}
            <Link target="_blank" href="https://neon-latency-benchmarks.vercel.app/">
              this benchmark instead
            </Link>
            .
          </p>
        </li>
      </ul>
    </div>
  )
}
