import React, { useEffect, useState } from 'react'

export default function TypingAnimation({
  text,
  speed = 100,
  cursor = true,
  className = '',
  onFinished,
}: {
  text: string
  speed?: number
  cursor?: boolean
  className?: string
  onFinished?: () => void
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index))
        setIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      onFinished?.()
    }
  }, [index, text, speed, onFinished])

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {displayedText}
      {cursor && <span className="animate-cursor text-terminal">_</span>}
    </div>
  )
}
