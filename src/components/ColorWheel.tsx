import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import { Palette } from 'lucide-react'

const DEFAULT_COLOR = '#22c55e'
const listeners = new Set<() => void>()

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

const readColor = () => {
  try {
    const saved = localStorage.getItem('terminal-color')
    if (saved) return saved
  } catch {
    // ignore storage read errors
  }
  return getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim() || DEFAULT_COLOR
}

export default function ColorWheel() {
  const color = useSyncExternalStore(subscribe, readColor, () => DEFAULT_COLOR)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('terminal-color')
      if (saved) document.documentElement.style.setProperty('--terminal', saved)
    } catch {
      // ignore storage read errors
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    document.documentElement.style.setProperty('--terminal', value)
    try {
      localStorage.setItem('terminal-color', value)
    } catch {
      // ignore storage write errors
    }
    listeners.forEach((notify) => notify())
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-terminal/50 transition"
        onClick={() => inputRef.current?.click()}
      >
        <Palette size={14} className="text-terminal" />
      </button>

      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={handleChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />

      {/* Tooltip */}
      <div className="absolute right-0 top-full mt-2 px-2 py-1 font-mono text-xs text-gray-400 bg-neutral-800 border border-neutral-700 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
        Change theme color
      </div>
    </div>
  )
}
