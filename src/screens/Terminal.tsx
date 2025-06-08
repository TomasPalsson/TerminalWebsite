import React from 'react'
import TypingAnimation from '../components/TypingAnimation'
import TerminalHandler from '../components/TerminalHandler'
import { KeyPressProvider } from '../context/KeypressedContext'
import useKeyClick from '../hooks/useKeyClick';

export function Terminal() {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  setTimeout(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, 50);

  return (
    <KeyPressProvider >
      <div className="relative justify-center h-screen px-4 overflow-y-auto text-white top-1">
        <TypingAnimation text="Welcome! To see all available commands type help" color="white" size="text-l" cursor={false} speed={10}
        className="font-mono"/>
        <TerminalHandler />
    </div>
    </KeyPressProvider >
  )
}
