import React, { useEffect, useState } from 'react'
import { Maximize2, Minimize2, X, Terminal } from 'lucide-react'
import ColorWheel from './ColorWheel'
import { Link } from 'react-router'

type MacBarProps = {
  fullscreenRef: React.RefObject<HTMLDivElement>
}

export default function MacBar({ fullscreenRef }: MacBarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener('fullscreenchange', handleChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
    }
  }, [])

  const handleToggleFullscreen = () => {
    const elem = fullscreenRef.current

    if (!document.fullscreenElement && elem?.requestFullscreen) {
      elem.requestFullscreen()
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center w-full gap-2 px-3 py-2 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
      {/* Window controls */}
      <div className="flex items-center gap-2">
        <Link to="/">
          <button className="group flex items-center justify-center w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition">
            <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100 transition" strokeWidth={3} />
          </button>
        </Link>

        <button className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition cursor-default" />

        <button
          className="group flex items-center justify-center w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100 transition" strokeWidth={3} />
          ) : (
            <Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100 transition" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <Terminal size={14} className="text-terminal" />
        <span className="font-mono text-sm text-gray-400">
          {window.location.hostname}
        </span>
      </div>

      {/* Color wheel */}
      <div className="ml-auto">
        <ColorWheel />
      </div>
    </div>
  )
}
