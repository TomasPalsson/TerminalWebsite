import React, { useState, useEffect, useRef } from 'react'
import { Palette } from 'lucide-react'

export default function ColorWheel() {
  const [color, setColor] = useState('#22c55e')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('terminal-color')
      if (saved) {
        setColor(saved)
        document.documentElement.style.setProperty('--terminal', saved)
        return
      }
    } catch {
      // ignore storage read errors
    }

    const style = getComputedStyle(document.documentElement)
    const current = style.getPropertyValue('--terminal').trim()
    if (current) setColor(current)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setColor(value)
    document.documentElement.style.setProperty('--terminal', value)
    try {
      localStorage.setItem('terminal-color', value)
    } catch {
      // ignore storage write errors
    }
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
