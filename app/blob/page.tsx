'use client'

import dynamic from 'next/dynamic'

const TerminalCanvas = dynamic(
  () => import('@/components/terminal/TerminalCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-black">
        <span className="font-mono text-terminal animate-pulse">
          Loading 3D...
        </span>
      </div>
    ),
  }
)

export default function BlobPage() {
  return <TerminalCanvas />
}
