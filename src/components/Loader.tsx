import React, { useEffect, useState } from "react";

export default function Loader({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const getRandomIndex = (currentIndex: number) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * phrases.length);
    } while (newIndex === currentIndex && phrases.length > 1);
    return newIndex;
  };

  useEffect(() => {
    const current = phrases[index];
    // Add random variation to timing
    const baseTypeSpeed = 50;
    const baseDeleteSpeed = 30;
    const randomVariation = Math.random() * 20 - 10; // Random number between -10 and 10
    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, sub + 1);
        setText(next);
        setSub(sub + 1);
        if (next === current) setTimeout(() => setDeleting(true), 900);
      } else {
        const next = current.slice(0, sub - 1);
        setText(next);
        setSub(sub - 1);
        if (next === "") {
          setDeleting(false);
          setSub(0);
          setIndex(getRandomIndex(index));
        }
      }
    }, deleting ? baseDeleteSpeed + randomVariation : baseTypeSpeed + randomVariation);
    return () => clearTimeout(timeout);
  }, [text, deleting, index, sub, phrases]);

  return (
    <p className="pt-8 font-mono text-lg text-terminal">{text}</p>
  );
}
