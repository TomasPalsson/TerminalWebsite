'use client'

import { useRef } from 'react'
import MacBar from '@/components/MacBar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const fullscreenRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={fullscreenRef}>
      <MacBar fullscreenRef={fullscreenRef} />
      <div className="pt-10">
        {children}
      </div>
    </div>
  )
}
