import type { Metadata } from 'next'
import { Providers } from './providers'
import { LayoutWrapper } from './layout-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'Terminal Portfolio',
  description: 'Interactive terminal-themed portfolio with LLM-powered tools and 3D experiences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 h-full">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
