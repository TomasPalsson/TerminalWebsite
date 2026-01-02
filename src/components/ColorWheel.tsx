
import React, { useState, useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';

export default function ColorWheel() {
  const [color, setColor] = useState('#22c55e');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('terminal-color');
      if (saved) {
        setColor(saved);
        document.documentElement.style.setProperty('--terminal', saved);
        return;
      }
    } catch {
      // ignore storage read errors
    }

    const style = getComputedStyle(document.documentElement);
    const current = style.getPropertyValue('--terminal').trim();
    if (current) setColor(current);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColor(value);
    document.documentElement.style.setProperty('--terminal', value);
    try {
      localStorage.setItem('terminal-color', value);
    } catch {
      // ignore storage write errors
    }
  };

  return (
    <>

    <div className="relative w-5 h-5">
      <Palette
        className="w-5 h-5 cursor-pointer text-terminal"
        onClick={() => inputRef.current?.click()}
      />

      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={handleChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>

    </>
  );
}
