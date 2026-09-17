'use client'

import dynamic from 'next/dynamic'

const CvViewer = dynamic(() => import('@/screens/CvViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <span className="font-mono text-terminal animate-pulse">Loading cv.pdf...</span>
    </div>
  ),
})

export default function CvPage() {
  return <CvViewer />
}
