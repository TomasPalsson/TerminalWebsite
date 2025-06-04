import React, { useState, useEffect } from 'react';

export default function ColorWheel() {
  const [color, setColor] = useState('#22c55e');

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const current = style.getPropertyValue('--terminal').trim();
    if (current) {
      setColor(current);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColor(value);
    document.documentElement.style.setProperty('--terminal', value);
  };

  return (
    <input
      aria-label="Pick terminal color"
      type="color"
      value={color}
      onChange={handleChange}
      className="w-5 h-5 p-0 m-0 border-none bg-transparent cursor-pointer"
    />
  );
}
