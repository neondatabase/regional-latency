import type { Metadata } from 'next'
import { IBM_Plex_Sans, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const sans = IBM_Plex_Sans({
  display: 'swap',
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Neon Regional Latencies',
  description: 'View the latencies of queries to Neon databases across different deployment platforms and regions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${sans.className} font-light my-6 sm:px-6 container mx-auto bg-neutral-950 text-white`}
      >
        {children}
      </body>
    </html>
  )
}
