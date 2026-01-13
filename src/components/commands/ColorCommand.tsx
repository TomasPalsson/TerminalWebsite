import React from 'react'
import { Command } from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Palette, Check, RotateCcw, Eye } from 'lucide-react'

const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(color)
}

const DEFAULT_COLOR = '#22c55e'

export const ColorCommand: Command = {
  name: 'color',
  description: 'Customize the terminal accent color',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">color [command] [value]</p>
      <p className="text-terminal mb-2">Commands:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">set #hex</span> — Set accent color</p>
        <p><span className="text-white">get</span> — Show current color</p>
        <p><span className="text-white">reset</span> — Reset to default</p>
      </div>
      <p className="text-gray-500 text-xs mt-3">Default: <span className="text-terminal">{DEFAULT_COLOR}</span></p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    if (!args || args.length === 0) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">Missing command</p>
          <p className="text-gray-500 mt-1">
            Try: <span className="text-terminal">color set #ff0000</span>, <span className="text-terminal">color get</span>, or <span className="text-terminal">color reset</span>
          </p>
        </div>
      )
    }

    const [command, value] = args

    if (command === 'set') {
      if (!value) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">No color provided</p>
            <p className="text-gray-500 mt-1">
              Example: <span className="text-terminal">color set #ff6b6b</span>
            </p>
          </div>
        )
      }

      if (!isValidHexColor(value)) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">Invalid hex color</p>
            <p className="text-gray-500 mt-1">Use format: #RGB or #RRGGBB</p>
          </div>
        )
      }

      document.documentElement.style.setProperty('--terminal', value)
      try {
        localStorage.setItem('terminal-color', value)
      } catch {
        // ignore storage failures
      }

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div
              className="w-4 h-4 rounded-full border border-neutral-700"
              style={{ backgroundColor: value }}
            />
            <span className="text-gray-400">Color set to</span>
            <span className="font-medium" style={{ color: value }}>{value}</span>
            <Check size={14} className="text-terminal" />
          </div>
        </div>
      )
    }

    if (command === 'get') {
      const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim()

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <Eye size={16} className="text-gray-500" />
            <span className="text-gray-400">Current color:</span>
            <div
              className="w-4 h-4 rounded-full border border-neutral-700"
              style={{ backgroundColor: currentColor }}
            />
            <span className="font-medium" style={{ color: currentColor }}>{currentColor}</span>
          </div>
        </div>
      )
    }

    if (command === 'reset') {
      document.documentElement.style.setProperty('--terminal', DEFAULT_COLOR)
      try {
        localStorage.removeItem('terminal-color')
      } catch {
        // ignore storage failures
      }

      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <RotateCcw size={14} className="text-gray-500" />
            <span className="text-gray-400">Reset to default:</span>
            <div
              className="w-4 h-4 rounded-full border border-neutral-700"
              style={{ backgroundColor: DEFAULT_COLOR }}
            />
            <span className="text-terminal font-medium">{DEFAULT_COLOR}</span>
          </div>
        </div>
      )
    }

    return (
      <div className="font-mono text-sm">
        <p className="text-red-400">Unknown command: {command}</p>
        <p className="text-gray-500 mt-1">
          Available: <span className="text-terminal">set</span>, <span className="text-terminal">get</span>, <span className="text-terminal">reset</span>
        </p>
      </div>
    )
  }
}
