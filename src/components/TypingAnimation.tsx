import React, { useEffect, useState } from 'react';

export default function TypingAnimation({ text, speed = 100, color = 'black', size = 'text-2xl', cursor = true }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text.charAt(index));
        setIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <div className={`font-mono ${size} ${color}`}>
      {displayedText}
      {cursor ? <span className="animate-pulse">|</span> : null}
    </div>
  );
}
