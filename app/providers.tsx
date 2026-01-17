'use client'

import { KeyPressProvider } from '@/context/KeypressedContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <KeyPressProvider>{children}</KeyPressProvider>
}
