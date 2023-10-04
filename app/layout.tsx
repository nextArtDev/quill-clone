import { ReduxProviders } from '@/redux/Providers'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import localFont from 'next/font/local'
import ReactQueryProvider from './providers/ReactQueryProvider'
import Navbar from '@/components/Navbar'
import TRPCProvider from './providers/tRPCProvider'

const inter = Inter({ subsets: ['latin'] })
const primaryFont = localFont({
  src: '../public/fonts/FarsiFont.woff2',
  variable: '--font-sans',
})
const numericFont = localFont({
  src: '../public/fonts/FarsiAdad.woff2',
  variable: '--font-adad',
})
const numericBoldFont = localFont({
  src: '../public/fonts/FarsiAdad-Bold.woff2',
  variable: '--font-adad-bold',
})
const numericRegularFont = localFont({
  src: '../public/fonts/FarsiAdad-Regular.woff2',
  variable: '--font-adad-reg',
})
export const metadata: Metadata = {
  title: 'quill',
  description: 'Generated by create next app',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa-IR" dir="rtl">
      <TRPCProvider>
        <body
          className={`${primaryFont.variable} min-h-screen grainy antialiased font-farsi adad  `}
        >
          <ReduxProviders>
            {/* <ReactQueryProvider> //here its part of trpc */}
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Toaster />
              <Navbar />
              {children}
            </ThemeProvider>
            {/* </ReactQueryProvider> */}
          </ReduxProviders>
        </body>
      </TRPCProvider>
    </html>
  )
}
