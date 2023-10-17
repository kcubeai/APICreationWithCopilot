import { AuthProvider } from '@/shared/utils/auth-context'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (<>
    <AuthProvider>

      <Component {...pageProps} />
    </AuthProvider>
  </>)
}
