import React from 'react'
import TypingAnimation from '../components/TypingAnimation'
import TerminalHandler from '../components/TerminalHandler'
import { KeyPressProvider } from '../context/KeypressedContext'

export function Terminal() {
  return (
    <KeyPressProvider>
      <div className="relative h-screen px-4 pt-2 pb-4 overflow-y-auto bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
            <TypingAnimation
              text="Welcome! Type help to see available commands"
              cursor={false}
              speed={15}
              className="font-mono text-sm text-gray-400"
            />
          </div>
          <TerminalHandler />
        </div>
      </div>
    </KeyPressProvider>
  )
}
