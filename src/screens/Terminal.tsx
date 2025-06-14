import React from 'react'
import TypingAnimation from '../components/TypingAnimation'
import TerminalHandler from '../components/TerminalHandler'
import { KeyPressProvider } from '../context/KeypressedContext'

export function Terminal() {
  return (
    <KeyPressProvider >
      <div className="relative justify-center h-screen px-4 overflow-y-auto text-white top-1">
        <TypingAnimation text="Welcome! To see all available commands type help" cursor={false} speed={10}
        className="font-mono"/>
        <TerminalHandler />
    </div>
    </KeyPressProvider >
  )
}
