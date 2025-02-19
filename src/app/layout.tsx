/* eslint-disable @next/next/no-sync-scripts */
import { FCC } from '@/types'

import '@/styles/index.css'

import { Providers } from '@/components/providers'

const RootLayout: FCC = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
