'use client'

import React, { ReactNode } from 'react'

interface TerminalOutputProps {
  output: ReactNode[]
  prompt: string
}

export function TerminalOutput({ output }: TerminalOutputProps) {
  return (
    <div className="space-y-4">
      {output.map((line, i) => (
        <div key={i} className="group">
          <div className="font-mono text-sm leading-relaxed">
            {line}
          </div>
        </div>
      ))}
    </div>
  )
}
