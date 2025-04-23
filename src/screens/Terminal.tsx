import React from 'react'
import TypingAnimation from '../components/TypingAnimation'
import TerminalHandler from '../components/TerminalHandler'
import { KeyPressProvider } from '../context/KeypressedContext'

export function Terminal() {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  setTimeout(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, 50);

  return (
    <KeyPressProvider >
      <div className="text-white h-screen relative top-1 p-5 pt-14 justify-center h-screen overflow-y-auto">
        <TypingAnimation text="Welcome! To see all available commands type help" color="white" size="text-l" cursor={false} speed={10}
        className="font-mono"/>
        <TerminalHandler />
    </div>
    </KeyPressProvider >
  )
}
