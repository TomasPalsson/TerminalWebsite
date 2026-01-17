import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Calculator, Equal } from 'lucide-react'

const calculate = (expression: string): number | null => {
  try {
    const cleanExpr = expression.replace(/\s+/g, '')
    if (!/^[0-9+\-*/().]+$/.test(cleanExpr)) {
      return null
    }
    return new Function(`return ${cleanExpr}`)()
  } catch {
    return null
  }
}

export const CalcCommand: Command = {
  name: 'calc',
  description: 'Perform basic arithmetic calculations',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">calc [expression]</p>
      <p className="text-terminal mb-2">Supported:</p>
      <div className="flex flex-wrap gap-2">
        {['+', '-', '*', '/', '(', ')'].map((op) => (
          <span key={op} className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-gray-400">
            {op}
          </span>
        ))}
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    if (!args || args.length === 0) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">No expression provided</p>
          <p className="text-gray-500 mt-1">
            Example: <span className="text-terminal">calc 2 + 2 * 3</span>
          </p>
        </div>
      )
    }

    const expression = args.join(' ')
    const result = calculate(expression)

    if (result === null) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">Invalid expression</p>
          <p className="text-gray-500 mt-1">Use only numbers and operators: +, -, *, /, (, )</p>
        </div>
      )
    }

    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
          <Calculator size={16} className="text-terminal" />
          <span className="text-gray-400">{expression}</span>
          <Equal size={14} className="text-gray-600" />
          <span className="text-terminal font-medium text-base">{result}</span>
        </div>
      </div>
    )
  }
}
