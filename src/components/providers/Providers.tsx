import { FCC } from '@/types'

import { ThemeProvider } from './theme-provider'

export const Providers: FCC = ({ children }) => {
  return (
    <>
      <ThemeProvider>{children}</ThemeProvider>
    </>
  )
}
