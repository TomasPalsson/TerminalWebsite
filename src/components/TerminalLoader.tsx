'use client'

import { useEffect, useState } from 'react'

const ASCII_LOGO = `┌──────────────┐
│   TERMINAL   │
└──────────────┘`

const bootMessages = [
  '> Initializing system...',
  '> Loading components...',
  '> Establishing connection...',
]

export default function TerminalLoader() {
  const [showLogo, setShowLogo] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1)
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([])
  const [typingText, setTypingText] = useState('')
  const [progress, setProgress] = useState(0)

  // Fade in logo
  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Start first message after logo appears
  useEffect(() => {
    if (showLogo && currentMessageIndex === -1) {
      const timer = setTimeout(() => setCurrentMessageIndex(0), 300)
      return () => clearTimeout(timer)
    }
  }, [showLogo, currentMessageIndex])

  // Typing effect for current message
  useEffect(() => {
    if (currentMessageIndex < 0 || currentMessageIndex >= bootMessages.length) return

    const message = bootMessages[currentMessageIndex]
    let charIndex = 0

    const typeInterval = setInterval(() => {
      if (charIndex < message.length) {
        setTypingText(message.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
        // Message complete, add to displayed and move to next
        setTimeout(() => {
          setDisplayedMessages(prev => [...prev, message])
          setTypingText('')
          setCurrentMessageIndex(prev => prev + 1)
        }, 200)
      }
    }, 30)

    return () => clearInterval(typeInterval)
  }, [currentMessageIndex])

  // Progress bar animation
  useEffect(() => {
    if (!showLogo) return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [showLogo])

  const filledBlocks = Math.floor(progress / 5)
  const emptyBlocks = 20 - filledBlocks
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks)

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="font-mono text-terminal text-center">
        {/* ASCII Logo with fade-in */}
        <pre
          className={`text-sm sm:text-base transition-opacity duration-500 ${
            showLogo ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}
        >
          {ASCII_LOGO}
        </pre>

        {/* Boot messages */}
        <div className="mt-4 text-left text-sm">
          {displayedMessages.map((msg, i) => (
            <div key={i} className="text-gray-500">{msg}</div>
          ))}
          {typingText && (
            <div>
              {typingText}
              <span className="animate-cursor">_</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {showLogo && (
          <div className="mt-4 text-xs sm:text-sm">
            <span className="text-gray-500">[</span>
            <span>{progressBar}</span>
            <span className="text-gray-500">]</span>
            <span className="ml-2">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
